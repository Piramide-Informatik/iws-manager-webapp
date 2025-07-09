import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { EmploymentContract } from '../../../../../Entities/employment-contract';
import { UserPreference } from '../../../../../Entities/user-preference';
import { _, TranslateService } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { Subscription } from 'rxjs';
import { EmploymentContractUtils } from '../../../utils/employment-contract-utils';
import { ActivatedRoute } from '@angular/router';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-employee-contracts-table',
  standalone: false,
  templateUrl: './employee-contracts-table.component.html',
})
export class EmployeeContractsTableComponent implements OnInit, OnDestroy {

  tableKey: string = 'EmployeeDetails'
  modalType: 'create' | 'delete' | 'edit' = 'create';
  visibleModal: boolean = false;
  @Input() customer: any;
  @Input() employeeId?: number;
  selectedEmployeeContract!: EmploymentContract | undefined;
  employeeContracts!: EmploymentContract[];
  userEmployeeDetailPreferences: UserPreference = {};
  dataKeys = ['startDate', 'salaryPerMonth', 'hoursPerWeek', 'workShortTime', 'maxHoursPerMonth', 'maxHoursPerDay', 'hourlyRate', 'specialPayment'];
  public cols!: Column[];
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly EmploymentContractUtils = inject(EmploymentContractUtils);
  private readonly route = inject(ActivatedRoute);

  private readonly subscriptions = new Subscription();

  public selectedColumns!: Column[];

  ngOnInit(): void {
    // Obtener el ID del empleado desde la URL (prioridad) o desde el input
    const employeeIdFromRoute = this.route.snapshot.paramMap.get('employeeId');
    if (employeeIdFromRoute) {
      this.employeeId = parseInt(employeeIdFromRoute, 10);
    }

    // Suscribirse a cambios en los parámetros de la ruta
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        const newEmployeeId = params.get('employeeId');
        if (newEmployeeId) {
          const parsedId = parseInt(newEmployeeId, 10);
          if (parsedId !== this.employeeId) {
            this.employeeId = parsedId;
            this.loadEmployeeContracts();
          }
        }
      })
    );

    // Cargar contratos inicialmente
    this.loadEmployeeContracts();

    this.loadEmployeeContractColumns();
    this.selectedColumns = this.cols;
    this.userEmployeeDetailPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    
    this.subscriptions.add(
      this.translate.onLangChange.subscribe(() => {
        this.loadEmployeeContractColumns();
        this.selectedColumns = this.cols;
        this.userEmployeeDetailPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadEmployeeContractColumns() {
    this.cols = [
      { field: 'startDate', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.START_DATE')) },
      { field: 'salaryPerMonth', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.SALARY_PER_MONTH')) },
      { field: 'hoursPerWeek', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.WEEKLY_HOURS')) },
      { field: 'workShortTime', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.WORK_SHORT_TIME')) },
      { field: 'maxHoursPerMonth', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.MAX_HOURS_PER_MONTH')) },
      { field: 'maxHoursPerDay', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.MAX_HOURS_PER_DAY')) },
      { field: 'hourlyRate', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.HOURLY_RATE')) },
      { field: 'specialPayment', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.SPECIAL_PAYMENT')) }
    ];
  }
  onUserEmployeeDetailPreferencesChanges(userEmployeeDetailPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userEmployeeDetailPreferences));
  }

  handleTableEvents(event: { type: 'create' | 'delete' | 'edit' , data?: any }): void {
    this.modalType = event.type;
    this.selectedEmployeeContract = event.data;
    this.visibleModal = true;
    if (event.type === 'create') {
      this.selectedEmployeeContract = undefined;
    }
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
  }

  private loadEmployeeContracts(): void {
    if (this.employeeId && this.employeeId > 0) {
      this.EmploymentContractUtils.getAllContractsByEmployeeId(this.employeeId).subscribe({
        next: (data) => {
          this.employeeContracts = data;
        },
        error: () => {
          this.employeeContracts = [];
        }
      });
    } else {
      this.employeeContracts = [];
    }
  }
}
