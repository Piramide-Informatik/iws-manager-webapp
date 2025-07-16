import { Component, inject, Input, OnDestroy, OnInit } from '@angular/core';
import { EmploymentContract } from '../../../../../Entities/employment-contract';
import { UserPreference } from '../../../../../Entities/user-preference';
import { _, TranslateService } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { Subscription } from 'rxjs';
import { EmploymentContractUtils } from '../../../utils/employment-contract-utils';
import { ActivatedRoute } from '@angular/router';
import { Employee } from '../../../../../Entities/employee';
import { EmployeeUtils } from '../../../utils/employee.utils';
import { MessageService } from 'primeng/api';

interface Column {
  field: string,
  header: string,
  type?: string;
  customClasses?: string[];
}

@Component({
  selector: 'app-employee-contracts-table',
  standalone: false,
  templateUrl: './employee-contracts-table.component.html',
})
export class EmployeeContractsTableComponent implements OnInit, OnDestroy {
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly EmploymentContractUtils = inject(EmploymentContractUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly employeeUtils = inject(EmployeeUtils);
  private readonly messageService = inject(MessageService);
  currentEmployee!: Employee;
  employeeContracts!: EmploymentContract[];
  selectedEmployeeContract!: EmploymentContract | undefined;

  @Input() customer: any;
  @Input() employeeId!: number;

  // Configuration table
  tableKey: string = 'EmployeeDetails'
  modalType: 'create' | 'delete' | 'edit' = 'create';
  visibleModal: boolean = false;
  userEmployeeDetailPreferences: UserPreference = {};
  dataKeys = ['startDate', 'salaryPerMonth', 'hoursPerWeek', 'workShortTime', 'maxHoursPerMonth', 'maxHoursPerDay', 'hourlyRate', 'specialPayment'];
  public cols!: Column[];

  private readonly subscriptions = new Subscription();

  public selectedColumns!: Column[];

  ngOnInit(): void {
    // Obtener el ID del empleado desde la URL (prioridad) o desde el input
    const employeeIdFromRoute = this.route.snapshot.paramMap.get('employeeId');
    if (employeeIdFromRoute) {
      this.employeeId = parseInt(employeeIdFromRoute, 10);
      this.employeeUtils.getEmployeeById(this.employeeId).subscribe(employee => {
        if (employee) this.currentEmployee = employee;
      })
    }
    
    // Suscribirse a cambios en los parámetros de la ruta
    this.subscriptions.add(
      this.route.paramMap.subscribe(params => {
        const newEmployeeId = params.get('employeeId');
        if (newEmployeeId) {
          const parsedId = parseInt(newEmployeeId, 10);
          if (parsedId !== this.employeeId) {
            this.employeeId = parsedId;
            this.loadEmployeeContracts(this.employeeId);
          }
        }
      })
    );

    // Cargar contratos inicialmente
    this.loadEmployeeContracts(this.employeeId);

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
      { field: 'startDate', type: 'date', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.START_DATE')), customClasses: ['align-right'] },
      { field: 'salaryPerMonth', type: 'double', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.SALARY_PER_MONTH')), customClasses: ['align-right'] },
      { field: 'hoursPerWeek', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.WEEKLY_HOURS')), customClasses: ['align-right'] },
      { field: 'workShortTime', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.WORK_SHORT_TIME')), customClasses: ['align-right'] },
      { field: 'maxHoursPerMonth', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.MAX_HOURS_PER_MONTH')), customClasses: ['align-right'] },
      { field: 'maxHoursPerDay', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.MAX_HOURS_PER_DAY')), customClasses: ['align-right'] },
      { field: 'hourlyRate', type: 'double', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.HOURLY_RATE')), customClasses: ['align-right'] },
      { field: 'specialPayment', type: 'double', header: this.translate.instant(_('EMPLOYEE.EMPLOYEE_CONTRACTS_TABLE.SPECIAL_PAYMENT')), customClasses: ['align-right'] }
    ];
  }
  onUserEmployeeDetailPreferencesChanges(userEmployeeDetailPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userEmployeeDetailPreferences));
  }

  handleTableEvents(event: { type: 'create' | 'delete' | 'edit', data?: any }): void {
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

  onEmployeeContractDeleted(workContractId: number) {
    this.employeeContracts = this.employeeContracts.filter(employeeContract => employeeContract.id !== workContractId);
  }

  onEmployeeContractUpdated(updatedContract: EmploymentContract): void {
    if (!updatedContract?.id) {
      console.error('Invalid contract received for update');
      return;
    }

    const index = this.employeeContracts.findIndex(c => c.id === updatedContract.id);

    if (index >= 0) {
      this.employeeContracts = [
        ...this.employeeContracts.slice(0, index),
        updatedContract,
        ...this.employeeContracts.slice(index + 1)
      ];
    } else {
      this.employeeContracts = [updatedContract, ...this.employeeContracts];
    }
  }

  private loadEmployeeContracts(employeeId: number): void {
    if (employeeId && employeeId > 0) {
      this.EmploymentContractUtils.getAllContractsByEmployeeId(employeeId).subscribe({
        next: (data) => {
          this.employeeContracts = [...data].reverse();
        },
        error: (err) => {
          console.log('Error load employee contracts', err);
          this.employeeContracts = [];
        }
      });
    } else {
      this.employeeContracts = [];
    }
  }

  updateEmployementContractsList(employeeId: number): void {
    this.loadEmployeeContracts(employeeId);
  }

  onMessageOperation(message: {severity: string, summary: string, detail: string}): void{
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail))
    });
  }
}
