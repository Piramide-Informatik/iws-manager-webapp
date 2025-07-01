import { Component, inject } from '@angular/core';
import { EmployeeContract } from '../../../models/employee-contract';
import { UserPreference } from '../../../../../Entities/user-preference';
import { _, TranslateService } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { Subscription } from 'rxjs';
//import { EmployeeContractService } from '../../../services/employee-contract.service';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-employee-contracts-table',
  standalone: false,
  templateUrl: './employee-contracts-table.component.html',
})
export class EmployeeContractsTableComponent {

  tableKey: string = 'EmployeeDetails'
  employeeContracts!: EmployeeContract[];
  userEmployeeDetailPreferences: UserPreference = {};
  dataKeys = ['startDate', 'salaryPerMonth', 'hoursPerWeek', 'workShortTime', 'maxHoursPerMonth', 'maxHoursPerDay', 'hourlyRate', 'specialPayment'];
  public cols!: Column[];
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
// private readonly employeeContractService = inject(EmployeeContractService);

  private langSubscription!: Subscription;

  public selectedColumns!: Column[];

  ngOnInit(): void {
   /* this.employeeContractService.getEmployeeContractsData().then((data) => {
      this.employeeContracts = data;
    });*/

    this.loadEmployeeContractColumns();
    this.selectedColumns = this.cols;
    this.userEmployeeDetailPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadEmployeeContractColumns();
      this.selectedColumns = this.cols;
      this.userEmployeeDetailPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
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
}
