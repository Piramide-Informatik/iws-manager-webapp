import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { EmploymentContract, EmploymentContractDisplay } from '../../../../Entities/employment-contract';
import { EmploymentContractUtils } from '../../utils/employment-contract-utils';
import { MessageService } from 'primeng/api';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { Customer } from '../../../../Entities/customer';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  customClasses?: string[];
  routerLink?: (row: any) => string;
}

@Component({
  selector: 'app-list-work-contracts',
  standalone: false,
  providers: [MessageService],
  templateUrl: './list-work-contracts.component.html',
  styleUrl: './list-work-contracts.component.scss',
})
export class ListWorkContractsComponent implements OnInit, OnDestroy {
  private readonly employmentContractUtils = inject(EmploymentContractUtils);
  private readonly customerUtils = inject(CustomerUtils);
  
  public customer!: Customer | undefined;
  contracts: EmploymentContractDisplay[] = [];
  loading: boolean = true;
  public cols!: Column[];
  private langSubscription!: Subscription;

  public selectedColumns!: Column[];
  userWorkContractsPreferences: UserPreference = {};
  tableKey: string = 'EmploymentContractOverview'
  dataKeys = ['employeeId', 'employeeFirstName', 'employeeLastName', 'startDate', 'salaryPerMonth', 'hoursPerWeek', 'workShortTime', 'specialPayment', 'maxHoursPerMonth', 'maxHoursPerDay', 'hourlyRate'];

  // properties for modal
  selectedContract: number | null = null;
  contractName: string = '';
  visibleContractModal: boolean = false;
  isLoading = false;

  constructor(
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit() {
    this.loadColHeaders();
    this.selectedColumns = this.cols;

    this.loading = false;
    this.userWorkContractsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userWorkContractsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.route.params.subscribe(params => {
      this.customerUtils.getCustomerById(params['id']).subscribe(customer => {
        this.customer = customer; 
      });

      this.loadContracts(params['id']);
    });
  }

  private loadContracts(customerId: string): void {
    this.employmentContractUtils.getAllContractsByCustomerId(+customerId).subscribe(contracts => {
      this.contracts = contracts.map(contract => this.mapContractForDisplay(contract));
    });
  }

  private mapContractForDisplay(contract: EmploymentContract): EmploymentContractDisplay {
    return {
      ...contract,
      employeeId: contract.employee?.id || 0,
      employeeFirstName: contract.employee?.firstname || '',
      employeeLastName: contract.employee?.lastname || ''
    };
  }

  loadColHeaders(): void {
    this.cols = [
      { 
        field: 'employeeId', 
        customClasses: ['align-right'],
        routerLink: (row: any) => `./contractDetails/${row.id}`, 
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.EMPLOYEE_ID'))
      },
      { 
        field: 'employeeFirstName', 
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.FIRST_NAME'))
      },
      { 
        field: 'employeeLastName', 
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.LAST_NAME'))
      },
      { 
        field: 'startDate', 
        customClasses: ['text-center'], 
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.START_DATE'))
      },
      { 
        field: 'salaryPerMonth', 
        customClasses: ['align-right'], 
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SALARY_PER_MONTH'))
      },
      { 
        field: 'hoursPerWeek', 
        customClasses: ['align-right'], 
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WEEKLY_HOURS'))
      },
      { 
        field: 'workShortTime', 
        customClasses: ['align-right'],  
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WORK_SHORT_TIME'))
      },
      { 
        field: 'specialPayment', 
        customClasses: ['align-right'],  
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SPECIAL_PAYMENT'))
      },
      { 
        field: 'maxHoursPerMonth', 
        customClasses: ['align-right'], 
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_MONTH'))
      },
      { 
        field: 'maxHoursPerDay', 
        customClasses: ['align-right'], 
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_DAY'))
      },
      { 
        field: 'hourlyRate', 
        customClasses: ['align-right'], 
        header: this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.HOURLY_RATE'))
      },
    ];
  }

  onUserWorkContractsPreferencesChanges(userWorkContractsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userWorkContractsPreferences));
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

  goToContractDetails(currentContract: EmploymentContract) {
    this.router.navigate(['contractDetails', currentContract.id], { 
      relativeTo: this.route,
      state: { customer: this.customer, contract: currentContract } 
    });
  }

  redirectToContractDetails() {
    this.router.navigate(['contractDetails'], { 
      relativeTo: this.route,
      state: { customer: this.customer, contract: {} } 
    });
  }

  handleContractTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    if (event.type === 'delete' && event.data) {
      this.selectedContract = event.data;
      
      const localContract = this.contracts.find(contract => contract.id === this.selectedContract);
      
      if (localContract) {
        const employeeName = `${localContract.employeeFirstName || ''} ${localContract.employeeLastName || ''}`.trim();
        this.contractName = employeeName || 'Unknown Employee';
        this.visibleContractModal = true;
      } else {
        this.employmentContractUtils.getEmploymentContractById(this.selectedContract!).subscribe({
          next: (contract) => {
            const employeeName = `${contract?.employee?.firstname || ''} ${contract?.employee?.lastname || ''}`.trim();
            this.contractName = employeeName || 'Unknown Employee';
            this.visibleContractModal = true;
          },
          error: (err) => {
            console.error('Error fetching contract:', err);
            this.contractName = 'Unknown Employee';
            this.visibleContractModal = true;
          }
        });
      }
    }
  }

  onContractDeleteConfirm() {
    this.isLoading = true;
    if (this.selectedContract) {
      this.employmentContractUtils.deleteEmploymentContract(this.selectedContract).subscribe({
        next: () => {
          this.isLoading = false;
          this.visibleContractModal = false;
          this.route.params.subscribe(params => {
            this.loadContracts(params['id']);
          });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Delete error:', error);
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: error.message ?? 'Failed to delete employment contract'
          });
        }
      });
    }
  }
}
