import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Table } from 'primeng/table';
import { TranslateService, _ } from '@ngx-translate/core';
import { of, Subscription, switchMap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { EmploymentContractUtils } from '../../../employee/utils/employment-contract-utils';
import { EmploymentContract } from '../../../../Entities/employment-contract';
import { Column } from '../../../../Entities/column';
import { CustomerStateService } from '../../../customer/utils/customer-state.service';
import { Title } from '@angular/platform-browser';
import { CustomerUtils } from '../../../customer/utils/customer-utils';

@Component({
  selector: 'app-list-work-contracts',
  standalone: false,
  templateUrl: './list-work-contracts.component.html',
  styleUrl: './list-work-contracts.component.scss',
})
export class ListWorkContractsComponent implements OnInit, OnDestroy {
  private readonly employmentContractUtils = inject(EmploymentContractUtils);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly translate = inject(TranslateService);
  private readonly route = inject(ActivatedRoute);
  private readonly customerState = inject(CustomerStateService);
  private readonly titleService = inject(Title);
  private readonly customerUtils = inject(CustomerUtils);

  currentContract!: EmploymentContract | undefined;
  public employmentContracts!: EmploymentContract[];

  // Configuration modal
  modalType: 'create' | 'delete' | 'edit' = 'create';
  visibleModal: boolean = false;
  loading: boolean = true;

  // Configuration table
  public cols!: Column[];
  public selectedColumns!: Column[];
  userWorkContractsPreferences: UserPreference = {};
  tableKey: string = 'WorkContracts'
  dataKeys = ['employeeId', 'firstName', 'lastName', 'startDate', 'salaryPerMonth', 'weeklyHours', 'worksShortTime', 'specialPayment', 'maxHrspPerMonth', 'maxHrsPerDay', 'hourlyRate'];
  @ViewChild('dt2') dt2!: Table;

  private readonly subscriptions = new Subscription();

  ngOnInit(): void {
    this.subscriptions.add(
      this.customerState.currentCustomer$
        .pipe(
          switchMap(customer => {
            if (customer) {
              this.updateTitle(customer?.customername1!);
              return this.employmentContractUtils.getAllContractsByCustomerIdSortedByEmployeeNo(customer.id);
            } else {
              const customerId = Number(this.route.snapshot.params['id']);
              if (customerId) {
                return this.customerUtils.getCustomerById(customerId).pipe(
                  switchMap(c => {
                    if (c) this.updateTitle(c.customername1!);
                    return this.employmentContractUtils.getAllContractsByCustomerIdSortedByEmployeeNo(customerId);
                  })
                );
              }
              return of([]);
            }
          })
        )
        .subscribe(employeeContracts => {
          this.employmentContracts = employeeContracts!;
        })
    );

    this.loadColHeaders();
    this.selectedColumns = this.cols;
    this.userWorkContractsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);

    this.subscriptions.add(
      this.translate.onLangChange.subscribe(() => {
        this.loadColHeaders();
        this.selectedColumns = this.cols;
        this.userWorkContractsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
      })
    );
  }

  onUserWorkContractsPreferencesChanges(userWorkContractsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userWorkContractsPreferences));
  }

  loadColHeaders(): void {
    this.cols = [
      {
        field: 'employee.employeeno',
        customClasses: ['align-right', 'date-font-style'],
        useSameAsEdit: true,
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.EMPLOYEE_ID'))
      },
      { field: 'employee.firstname', header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.FIRST_NAME')) },
      { field: 'employee.lastname', header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.LAST_NAME')) },
      { field: 'startDate', type: 'date', customClasses: ['text-center'], header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.START_DATE')) },
      { field: 'salaryPerMonth', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SALARY_PER_MONTH')) },
      { field: 'hoursPerWeek', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WEEKLY_HOURS')) },
      { field: 'workShortTime', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WORK_SHORT_TIME')) },
      { field: 'maxHoursPerMonth', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_MONTH')) },
      { field: 'maxHoursPerDay', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_DAY')) },
      { field: 'hourlyRate', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.HOURLY_RATE')) },
      { field: 'specialPayment', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SPECIAL_PAYMENT')) },
    ];
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  handleTableEvents(event: { type: 'create' | 'delete' | 'edit', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete') {
      this.currentContract = this.employmentContracts.find(c => c.id === event.data);
    } else if (event.type === 'edit') {
      this.currentContract = event.data
    } else if (event.type === 'create') {
      this.currentContract = undefined
    }
    this.visibleModal = true;
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
  }

  onDeleteEmployeeContract(deletedWorkContract: EmploymentContract) {
    this.employmentContracts = this.employmentContracts.filter(c => c.id !== deletedWorkContract.id);
    this.currentContract = undefined;
  }

  onCreateEmployeeContract(newEmployeeContract: EmploymentContract) {
    if (newEmployeeContract) {
      this.employmentContracts.unshift(newEmployeeContract);
    }
  }

  onUpdateEmployeeContract(updatedEmployeeContract: EmploymentContract) {
    const index = this.employmentContracts.findIndex(e => e.id === updatedEmployeeContract.id);
    if (index !== -1) {
      this.employmentContracts[index] = { ...updatedEmployeeContract };
      this.employmentContracts = [...this.employmentContracts];
    }
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(
      `${this.translate.instant('PAGETITLE.CUSTOMER')} ${name} ${this.translate.instant('PAGETITLE.CUSTOMERS.EMPLOYMENT_CONTRACTS')}`
    );
  }
}
