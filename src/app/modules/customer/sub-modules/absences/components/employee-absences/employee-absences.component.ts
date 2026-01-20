import { Component, computed, inject, OnDestroy, OnInit, signal, Signal } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '../../../../../../Entities/customer';
import { CustomerStateService } from '../../../../utils/customer-state.service';
import { combineLatest, of, Subscription, switchMap, take, tap, startWith } from 'rxjs';
import { CustomerUtils } from '../../../../utils/customer-utils';
import moment from 'moment';
import { EmployeeUtils } from '../../../employee/utils/employee.utils';
import { Employee } from '../../../../../../Entities/employee';
import { toSignal } from '@angular/core/rxjs-interop';
import { Column } from '../../../../../../Entities/column';
import { TranslateService } from '@ngx-translate/core';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { AbsenceTypeUtils } from '../../../../../master-data/components/absence-types/utils/absence-type-utils';
import { PublicHolidayUtils } from '../../../../../master-data/components/holidays/utils/public-holiday-utils';
import { DayOff } from '../../../../../../Entities/dayOff';
import { AbsenceDayCountDTO } from '../../../../../../Entities/AbsenceDayCountDTO';
import { AbsenceDayUtils } from '../../utils/absenceday-utils';
import { Title } from '@angular/platform-browser';
import { HolidayYearUtils } from '../../../../../master-data/components/holidays/utils/holiday-year-utils';

interface EmployeeWithFullName extends Employee {
  fullName: string;
}

@Component({
  selector: 'app-employee-absences',
  standalone: false,
  templateUrl: './employee-absences.component.html',
  styleUrl: './employee-absences.component.scss'
})
export class EmployeeAbsencesComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly customerStateService = inject(CustomerStateService);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly customerId: number = Number(this.route.snapshot.params['id']);
  private readonly subscriptions = new Subscription();
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private langSubscription!: Subscription;
  private readonly absenceTypeUtils = inject(AbsenceTypeUtils);
  private readonly publicHolidayUtils = inject(PublicHolidayUtils);
  private readonly holidayYearUtils = inject(HolidayYearUtils);
  private readonly absenceDayUtils = inject(AbsenceDayUtils);
  private readonly titleService = inject(Title);

  private readonly _absenceDayCounts = signal<AbsenceDayCountDTO[]>([]);

  readonly absenceDayCounts = computed(() => {
    return this._absenceDayCounts().map(countDTO => {
      const absenceType = countDTO.absenceType;
      if (!absenceType) return null;
      return {
        id: absenceType.id,
        version: absenceType.version,
        createdAt: absenceType.createdAt,
        updatedAt: absenceType.updatedAt,
        type: absenceType.name,
        abbreviation: absenceType.label,
        fractionOfDay: absenceType.shareOfDay,
        isVacation: absenceType.isHoliday && absenceType.isHoliday == 1,
        canBeBooked: absenceType.hours && absenceType.hours == 1,
        number: countDTO.calculatedCount
      };
    }).filter(item => item !== null);
  });

  currentCustomer!: Customer;

  employees: Signal<Employee[] | undefined> = toSignal(
    this.employeeUtils.getAllEmployeesByCustomerId(this.customerId)
  );

  processedEmployees = computed<EmployeeWithFullName[] | undefined>(() => {
    const employeesList = this.employees();

    if (!employeesList) return undefined;

    return employeesList.map(emp => {
      const employeeWithFullName: EmployeeWithFullName = {
        ...emp,
        fullName: this.formatFullName(emp)
      };
      return employeeWithFullName;
    });
  });

  selectedEmployee!: Employee | undefined;
  years: number[] = []; // Values of dropdown
  formYearEmployee!: FormGroup;
  holidaysAndWeekend: DayOff[] = [];
  holidaysWeekendMap = new Map<string, DayOff>();
  currentYear: number = moment().year();

  //Table absence type-day
  tableKey = 'AbsenceTypeDay';
  dataKeys = ['abbreviation', 'type', 'number'];
  public cols!: Column[];
  public selectedColumns!: Column[];
  userAbsenceTypeDayPreferences: UserPreference = {};

  ngOnInit(): void {
    this.absenceTypeUtils.loadInitialData().subscribe();
    this.loadColHeaders();
    this.selectedColumns = [...this.cols];
    this.titleService.setTitle(this.translate.instant('PAGETITLE.CUSTOMERS.ABSENCES'));
    this.userAbsenceTypeDayPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = [...this.cols];
      this.titleService.setTitle(this.translate.instant('PAGETITLE.CUSTOMERS.ABSENCES'));
      this.userAbsenceTypeDayPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
    this.initForm();
    this.getCurrentCustomer();
    this.getYears();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.langSubscription.unsubscribe();
  }

  private initForm(): void {
    this.formYearEmployee = new FormGroup({
      year: new FormControl(this.currentYear),
      employeeFullName: new FormControl(),
      employeeno: new FormControl({ value: '', disabled: true })
    });

    this.subscriptions.add(
      this.formYearEmployee.get('employeeFullName')?.valueChanges.subscribe((employeeId: number | null) => {
        if (employeeId) {
          this.selectedEmployee = this.employees()?.find(e => e.id === employeeId);
          if (this.selectedEmployee) {
            this.formYearEmployee.patchValue({
              employeeno: this.selectedEmployee.employeeno
            }, { emitEvent: false });
          }
        } else {
          this.selectedEmployee = undefined;
          this.formYearEmployee.patchValue({
            employeeno: ''
          }, { emitEvent: false });
          this._absenceDayCounts.set([]); // Clear counts if no employee
        }
      })
    );

    // Observe combined changes to load counts
    this.subscriptions.add(
      combineLatest([
        this.formYearEmployee.get('employeeFullName')!.valueChanges.pipe(startWith(null)),
        this.formYearEmployee.get('year')!.valueChanges.pipe(startWith(this.currentYear))
      ]).subscribe(([employeeId, year]: [number | null, number | null]) => {
        if (employeeId && year) {
          this.loadAbsenceDayCounts(employeeId, year);
        } else if (!employeeId) {
          this._absenceDayCounts.set([]); // Clear counts if no employee
        }
      })
    );

    this.checkChangeSelectedYear();
  }

  private loadAbsenceDayCounts(employeeId: number, year: number): void {
    this.subscriptions.add(
      this.absenceDayUtils.countAbsenceDaysByTypeForEmployeeAndYear(employeeId, year).subscribe({
        next: (counts) => {
          this._absenceDayCounts.set(counts);
        },
        error: (err) => {
          console.error('Error loading absence day counts:', err);
          this._absenceDayCounts.set([]);
        }
      })
    );
  }

  private checkChangeSelectedYear(): void {
    this.subscriptions.add(
      this.formYearEmployee.get('year')?.valueChanges.subscribe((selectedYear: number) => {
        this.currentYear = selectedYear;

        // Reload holidays and weekends for the new year
        this.loadHolidaysAndWeekends(selectedYear);
      })
    );
  }

  private getCurrentCustomer(): void {
    if (!this.customerId || Number.isNaN(this.customerId)) return;

    this.customerStateService.currentCustomer$.pipe(
      take(1),
      switchMap(customerFromState => {
        if (customerFromState && customerFromState.id === this.customerId) {
          return of(customerFromState);
        }
        return this.customerUtils.getCustomerById(this.customerId);
      }),
      tap(customer => {
        if (customer) {
          this.currentCustomer = customer;
          this.customerStateService.setCustomerToEdit(customer);

          // Load holidays and weekends now that we have the customer with stateId
          if (this.currentYear) {
            this.loadHolidaysAndWeekends(this.currentYear);
          }
        }
      })
    ).subscribe({
      error: (error) => console.error('Error:', error)
    });
  }

  onCalendarAbsenceChanged(): void {
    const employeeId = this.formYearEmployee.get('employeeFullName')?.value;
    const year = this.formYearEmployee.get('year')?.value;

    if (employeeId && year) {
      this.loadAbsenceDayCounts(employeeId, year);
    }
  }

  private loadHolidaysAndWeekends(year: number): void {
    this.holidaysWeekendMap.clear();

    // Get the stateId from the current customer
    const stateId = this.currentCustomer?.state?.id;

    // Load standard holidays and weekends filtered by state
    this.subscriptions.add(
      this.publicHolidayUtils.getAllHolidaysAndWeekendByYear(year, stateId).subscribe(holidaysAndWeekends => {
        this.holidaysAndWeekend = holidaysAndWeekends;
        for (const dayOff of holidaysAndWeekends) {
          this.holidaysWeekendMap.set(dayOff.date, dayOff);
        }

        // Also load non-fixed holidays from holiday-year table
        this.holidayYearUtils.getAllHolidayYears().subscribe(holidayYears => {
          const yearStr = year.toString();
          const filteredYears = holidayYears.filter(hy => hy.year === yearStr);
          for (const hy of filteredYears) {
            this.holidaysWeekendMap.set(hy.date, {
              date: hy.date,
              name: hy.publicHoliday.name
            });
          }
        });
      })
    );
  }

  private getYears(): void {
    const startYear = 2016;
    const currentYear = moment().year();
    const endYear = currentYear + 5;

    for (let year = startYear; year <= endYear; year++) {
      this.years.push(year);
    }
  }

  private loadColHeaders(): void {
    this.cols = [
      { field: 'abbreviation', classesTHead: ['width-10'], header: this.translate.instant('ABSENCE_TYPES.LABEL.ABBREVIATION') },
      { field: 'type', header: this.translate.instant('ABSENCE_TYPES.LABEL.TYPE') },
      { field: 'number', type: 'double', classesTHead: ['width-10'], header: this.translate.instant('ORDER_PROYECT.TABLE.NUMBER'), filter: { type: 'numeric' }, customClasses: ['align-right'] }
    ];
  }

  loadEmployeeAfterRefreshOCC(employeeId: number): void {
    this.employeeUtils.getEmployeeById(employeeId).subscribe({
      next: (employee) => {
        if (employee) {
          this.selectedEmployee = employee;
          this.formYearEmployee.patchValue({
            employeeFullName: this.selectedEmployee.id
          });
        }
        localStorage.removeItem('selectedEmployeeId');
      },
      error: () => {
        localStorage.removeItem('selectedEmployeeId');
      }
    })
  }

  private formatFullName(employee: Employee): string {
    return `${employee.firstname} ${employee.lastname}`.trim();
  }
}