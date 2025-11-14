//employee-overview.component.ts
import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Employee } from '../../../../Entities/employee';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService, _ } from "@ngx-translate/core";
import { map, Subscription } from 'rxjs';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { EmployeeUtils } from '../../utils/employee.utils';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { Customer } from '../../../../Entities/customer';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { Column } from '../../../../Entities/column';
import { Title } from '@angular/platform-browser';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';
import { HttpErrorResponse } from '@angular/common/http';
import { QualificationFZUtils } from '../../../master-data/components/employee-qualification/utils/qualificationfz-util';

@Component({
  selector: 'app-employee-overview',
  standalone: false,
  templateUrl: './employee-overview.component.html',
  styleUrl: './employee-overview.component.scss'
})
export class EmployeeOverviewComponent implements OnInit, OnDestroy {
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly titleService = inject(Title);
  private readonly qualificationFZUtils = inject(QualificationFZUtils);
  public customer!: Customer | undefined;
  employees: Employee[] = [];
  @ViewChild('dt2') dt2!: Table;
  public cols!: Column[];
  private langSubscription!: Subscription;

  public selectedColumns!: Column[];
  public qualificationsFZ!: any[];

  userEmployeeOverviewPreferences: UserPreference = {};
  tableKey: string = 'EmployeeOverview'
  dataKeys = ['id', 'firstname', 'lastname', 'email', 'generalmanagersince', 'shareholdersince', 'soleproprietorsince', 'coentrepreneursince', 'qualificationFZ', 'qualificationkmui'];

  // properties for delete modal
  employeeType: 'create' | 'delete' = 'create';
  selectedEmployee: number | null = null;
  employeeName: string = '';
  visibleEmployeeModal: boolean = false;
  isLoading = false;
  errorMessage: string = '';
  showOCCErrorModaEmployee = false;
  public occErrorType: OccErrorType = 'DELETE_UNEXISTED';

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly commonMessageService: CommonMessagesService
  ) { }

  ngOnInit() {
    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userEmployeeOverviewPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.updateTitle('...');
    this.route.params.subscribe(params => {
      this.customerUtils.getCustomerById(params['id']).subscribe(customer => {
        this.customer = customer;
        this.updateTitle(this.customer?.customername1!);
      });

      this.employeeUtils.getAllEmployeesByCustomerId(params['id']).subscribe(employees => {
        this.employees = employees;
      })
    })

    this.selectedColumns = this.cols;
  }

  loadColHeaders(): void {
    this.cols = [
      {
        field: 'employeeno',
        routerLink: (row: any) => `./employee-details/${row.id}`,
        header: this.translate.instant(_('EMPLOYEE.TABLE.EMPLOYEE_ID')),
        customClasses: ['align-right', 'date-font-style','narrow-column','employee-narrow'],
        classesTHead: ['employee-narrow']
      },
      { field: 'firstname', header: this.translate.instant(_('EMPLOYEE.TABLE.FIRST_NAME')), customClasses: ['employee-wide'], classesTHead: ['employee-wide'] },
      { field: 'lastname', header: this.translate.instant(_('EMPLOYEE.TABLE.LAST_NAME')), customClasses: ['employee-wide'], classesTHead: ['employee-wide'] },
      { field: 'email', header: this.translate.instant(_('EMPLOYEE.TABLE.EMAIL')),  customClasses: ['employee-medium'], classesTHead: ['employee-medium'] },
      { field: 'generalmanagersince', type: 'date', header: this.translate.instant(_('EMPLOYEE.TABLE.GM_SINCE_DATE')), customClasses: ['align-right','employee-narrow-date'], classesTHead: ['employee-narrow-date']  }, //GF
      { field: 'shareholdersince', type: 'date', header: this.translate.instant(_('EMPLOYEE.TABLE.SH_SINCE_DATE')), customClasses: ['align-right', 'employee-narrow-date'], classesTHead: ['employee-narrow-date'] }, //Gest
      { field: 'soleproprietorsince', type: 'date', header: this.translate.instant(_('EMPLOYEE.TABLE.SP_SINCE_DATE')), customClasses: ['align-right', 'employee-narrow-date'], classesTHead: ['employee-narrow-date'] }, //EU
      { field: 'coentrepreneursince', type: 'date', header: this.translate.instant(_('EMPLOYEE.TABLE.CE_SINCE_DATE')), customClasses: ['align-right', 'employee-narrow-date'], classesTHead: ['employee-narrow-date'] }, //MU
      {
        field: 'qualificationFZ.qualification', header: this.translate.instant(_('EMPLOYEE.TABLE.QUALI_FZ')), filter: {
          type: 'multiple',
          data: this.qualificationsFZ
        },customClasses: ['employee-medium'], classesTHead: ['employee-medium']
      },
      { field: 'qualificationkmui', header: this.translate.instant(_('EMPLOYEE.TABLE.QUALI_MKUI')),customClasses: ['employee-medium'], classesTHead: ['employee-medium']},

    ];
    // Load grades dynamically
    this.qualificationFZUtils.getAllQualifications().pipe(
      map(qualifications =>
        qualifications
          .filter(q => q.qualification) // Filter null/undefined values
          .map(q => ({
            label: q.qualification!,
            value: q.qualification!
          }))
          .sort((a, b) => a.label.localeCompare(b.label)) // Sort alphabetically
      )
    ).subscribe({
      next: (filterData) => {
        const noneLabel = this.translate.instant(('FILTER.OPTIONS.SELECT_NONE'));
        
        this.qualificationsFZ = [
          { label: noneLabel, value: null },
          ...filterData.map(qualificationFz => ({ label: qualificationFz.label, value: qualificationFz.value }))
        ];

        const qualificationCol = this.cols.find(col => col.field === 'qualificationFZ.qualification');

        if (qualificationCol?.filter) {
          qualificationCol.filter.data = this.qualificationsFZ;
        }
      },
      error: (err) => {
        console.error('Error loading qualifications for filter:', err);
      }
    });
  }

  onUserEmployeeOverviewPreferencesChanges(userEmployeeOverviewPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userEmployeeOverviewPreferences));
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }


  goToEmployeeDetails(currentEmployee: Employee) {
    this.router.navigate(['employee-details', currentEmployee.id], {
      relativeTo: this.route,
      state: { customer: this.customer, employee: currentEmployee }
    });
  }

  redirectToEmployeeDetails() {
    this.router.navigate(['employee-details'], { relativeTo: this.route });
  }

  handleEmployeeTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.employeeType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedEmployee = event.data;

      const localEmployee = this.employees.find(emp => emp.id === this.selectedEmployee);

      if (localEmployee) {

        const firstName = localEmployee.firstname ?? (localEmployee as any).firstname ?? '';
        const lastName = localEmployee.lastname ?? (localEmployee as any).lastname ?? '';

        this.employeeName = `${firstName} ${lastName}`.trim();
        this.visibleEmployeeModal = true;
      } else {
        this.employeeUtils.getEmployeeById(this.selectedEmployee!).subscribe({
          next: (employee) => {

            const firstName = employee?.firstname ?? (employee as any)?.firstname ?? '';
            const lastName = employee?.lastname ?? (employee as any)?.lastname ?? '';

            this.employeeName = `${firstName} ${lastName}`.trim();
            this.visibleEmployeeModal = true;
          },
          error: (err) => {
            console.error('Error fetching employee:', err);
            this.employeeName = '';
            this.visibleEmployeeModal = true;
          }
        });
        return;
      }
    }

    if (event.type !== 'delete') {
      this.visibleEmployeeModal = true;
    }
  }

  onEmployeeDeleteConfirm() {
    this.isLoading = true;
    if (this.selectedEmployee) {
      this.employeeUtils.deleteEmployee(this.selectedEmployee).subscribe({
        next: () => {
          this.isLoading = false;
          this.visibleEmployeeModal = false;
          this.commonMessageService.showDeleteSucessfullMessage();
          this.route.params.subscribe(params => {
            this.employeeUtils.getAllEmployeesByCustomerId(params['id']).subscribe(employees => {
              this.employees = employees;
            })
          })
        },
        error: (error) => {
          this.isLoading = false;
          this.visibleEmployeeModal = false;
          if (error instanceof OccError || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED') {
            this.showOCCErrorModaEmployee = true;
            this.commonMessageService.showErrorDeleteMessage();
            this.occErrorType = 'DELETE_UNEXISTED';
          } else if (error instanceof HttpErrorResponse && error.status === 500 && error.error.message.includes('foreign key constraint')) {
            this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
          } else {
            this.commonMessageService.showErrorDeleteMessage();
          }
        }
      });
    }
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(this.translate.instant('PAGETITLE.CUSTOMERS.EMPLOYEES'));
  }

}
