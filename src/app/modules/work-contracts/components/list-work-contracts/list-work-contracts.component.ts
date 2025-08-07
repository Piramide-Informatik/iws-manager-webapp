import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { Table } from 'primeng/table';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { EmploymentContractUtils } from '../../../employee/utils/employment-contract-utils';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  customClasses?: string[];
  routerLink?: (row: any) => string;
  type?: string;
}

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
  private langSubscription!: Subscription;

  currentContract!: any;
  public contracts!: WorkContract[];

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

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.employmentContractUtils.getAllContractsByCustomerId(params['id']).subscribe( employeeContracts => {
        this.contracts = employeeContracts.map( ec => {
          return {
            id: ec.id,
            employeeId: ec.employee?.id,
            firstName: ec.employee?.firstname,
            lastName: ec.employee?.lastname,
            startDate: ec.startDate,
            salaryPerMonth: ec.salaryPerMonth,
            weeklyHours: ec.hoursPerWeek,
            worksShortTime: ec.workShortTime,
            specialPayment: ec.specialPayment,
            maxHrspPerMonth: ec.maxHoursPerMonth,
            maxHrsPerDay: ec.maxHoursPerDay,
            hourlyRate: ec.hourlyRate
          }
        })
      })
    });
    this.loadColHeaders();
    this.selectedColumns = this.cols;
    this.userWorkContractsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.userWorkContractsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  onUserWorkContractsPreferencesChanges(userWorkContractsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userWorkContractsPreferences));
  }

  loadColHeaders(): void {
    this.cols = [
      { 
        field: 'employeeId', 
        customClasses: ['align-right'],
        routerLink: (row: any) => `./contractDetails/${row.employeeId}`, 
        header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.EMPLOYEE_ID'))
      },
      { field: 'firstName', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.FIRST_NAME'))},
      { field: 'lastName', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.LAST_NAME'))},
      { field: 'startDate', type: 'date', customClasses: ['text-center'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.START_DATE'))},
      { field: 'salaryPerMonth', type: 'double', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SALARY_PER_MONTH'))},
      { field: 'weeklyHours', type: 'double', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WEEKLY_HOURS'))},
      { field: 'worksShortTime', type: 'double', customClasses: ['align-right'],  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WORK_SHORT_TIME'))},
      { field: 'specialPayment', type: 'double', customClasses: ['align-right'],  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SPECIAL_PAYMENT'))},
      { field: 'maxHrspPerMonth', type: 'double', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_MONTH'))},
      { field: 'maxHrsPerDay', type: 'double', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_DAY'))},
      { field: 'hourlyRate', type: 'double', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.HOURLY_RATE'))},
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete' | 'edit' , data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete') {
      this.currentContract = this.contracts.find(c => c.id === event.data)
    }
    this.visibleModal = true;
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
  }

  onDeleteEmployeeContract(deletedWorkContract: WorkContract) {
    this.contracts = this.contracts.filter(c => c.id !== deletedWorkContract.id);
    this.currentContract = undefined;
  }

  onContractCreated(newContract: any) {
    if (newContract) {
      this.contracts = [...this.contracts, {
        id: newContract.id,
        employeeId: newContract.employee?.id,
        firstName: newContract.employee?.firstname,
        lastName: newContract.employee?.lastname,
        startDate: newContract.startDate,
        salaryPerMonth: newContract.salaryPerMonth,
        weeklyHours: newContract.hoursPerWeek,
        worksShortTime: newContract.workShortTime,
        specialPayment: newContract.specialPayment,
        maxHrspPerMonth: newContract.maxHoursPerMonth,
        maxHrsPerDay: newContract.maxHoursPerDay,
        hourlyRate: newContract.hourlyRate
      }];
    }
  }
}
