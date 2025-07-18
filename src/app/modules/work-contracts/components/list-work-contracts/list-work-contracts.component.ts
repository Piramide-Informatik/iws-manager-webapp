import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { WorkContractsService } from '../../services/work-contracts.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  customClasses?: string[];
  routerLink?: (row: any) => string;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-list-work-contracts',
  standalone: false,
  providers: [MessageService, ConfirmationService, WorkContractsService],
  templateUrl: './list-work-contracts.component.html',
  styleUrl: './list-work-contracts.component.scss',
})
export class ListWorkContractsComponent implements OnInit, OnDestroy {

  public cols!: Column[];

  public selectedColumns!: Column[];

  public customer!: string;
  productDialog: boolean = false;
  modalType: 'create' | 'delete' | 'edit' = 'create';
  visibleModal: boolean = false;
  currentContract!: WorkContract;
  public contracts: WorkContract[] = [];
  selectedProducts: WorkContract[] | null | undefined;
  submitted: boolean = true;
  searchTerm: string = '';
  statuses!: any[];
  userWorkContractsPreferences: UserPreference = {};
  tableKey: string = 'WorkContracts'
  dataKeys = ['employeeId', 'firstName', 'lastName', 'startDate', 'salaryPerMonth', 'weeklyHours', 'worksShortTime', 'specialPayment', 'maxHrspPerMonth', 'maxHrsPerDay', 'hourlyRate'];


  @ViewChild('dt2') dt2!: Table;

  loading: boolean = true;

  private langSubscription!: Subscription;

  exportColumns!: ExportColumn[];
  constructor(
    private readonly workContractsService: WorkContractsService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly cd: ChangeDetectorRef,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    this.loadColHeaders();
    this.selectedColumns = this.cols;
    this.customer = 'Joe Doe';

    this.contracts = this.workContractsService.list();
    this.userWorkContractsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userWorkContractsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.selectedColumns = this.cols;
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
      { field: 'startDate', customClasses: ['text-center'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.START_DATE'))},
      { field: 'salaryPerMonth', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SALARY_PER_MONTH'))},
      { field: 'weeklyHours', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WEEKLY_HOURS'))},
      { field: 'worksShortTime', customClasses: ['align-right'],  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WORK_SHORT_TIME'))},
      { field: 'specialPayment', customClasses: ['align-right'],  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SPECIAL_PAYMENT'))},
      { field: 'maxHrspPerMonth', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_MONTH'))},
      { field: 'maxHrsPerDay', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_DAY'))},
      { field: 'hourlyRate', customClasses: ['align-right'], header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.HOURLY_RATE'))},
    ];
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

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  exportCSV() {
    if (this.contracts?.length) {
      setTimeout(() => {
        if (this.dt2?.exportCSV) {
          this.dt2.exportCSV();
        } else {
          console.error('La tabla no tiene el método exportCSV disponible');
        }
      }, 0);
    } else {
      console.error('No hay datos para exportar');
    }
  }

  editWorkContract(currentContract: WorkContract) {
    this.currentContract = { ...currentContract };
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contracts = this.contracts.filter(
          (val) => !this.selectedProducts?.includes(val)
        );
        this.selectedProducts = null;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Products Deleted',
          life: 3000,
        });
      },
    });
  }

  hideDialog() {
    this.productDialog = false;
    this.submitted = false;
  }

  deleteWorkContract(workContractEmployeeId: any) {
     this.confirmationService.confirm({
      message: this.translate.instant(_('DIALOG.DELETE'), { value: workContractEmployeeId }),
      header: this.translate.instant(_('DIALOG.CONFIRM_TITLE')),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant(_('DIALOG.ACCEPT_LABEL')),
      rejectLabel: this.translate.instant(_('DIALOG.REJECT_LABEL')),
      accept: () => {
        this.contracts = this.contracts.filter(
          (val) => val.employeeId !== workContractEmployeeId
        );
        this.messageService.add({
          severity: 'success',
          summary: this.translate.instant(_('DIALOG.SUCCESSFUL_MESSAGE')),
          detail: this.translate.instant(_('DIALOG.WORKCONTRACT_SUCCESS_DELETED_MESSAGE')),
          life: 3000
        });
      },
    });
  }

  goToWorkContractDetails(currentWContract: WorkContract) {
    this.router.navigate(['contractDetails', currentWContract.employeeId], { 
      relativeTo: this.route,
      state: { customer: "Joe Doe", workContract: currentWContract } 
    });
  }

  handleTableEvents(event: { type: 'create' | 'delete' | 'edit' , data?: any }): void {
    this.modalType = event.type;
    this.visibleModal = true;
  }

  createWorkContractDetails() {
    this.router.navigate(['contractDetails'], { 
      relativeTo: this.route,
      state: { customer: "Joe Doe", workContract: {} } 
    });
  }

  findIndexById(id: number): number {
    return this.contracts.findIndex(
      (currentContract) => currentContract.employeeId === id
    );
  }

  createUniqueId(): number {
    let id: number;
    do {
      id = Math.floor(Math.random() * 1000);
    } while (
      this.contracts.some(
        (currentContract) => currentContract.employeeId === id
      )
    );
    return id;
  }
  getSeverity(status: string) {
    if (status === 'Active') {
      return 'success';
    }
    if (status === 'Pending') {
      return 'warning';
    }
    return 'info';
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
  }

  saveProduct() {
    this.submitted = true;

    if (this.currentContract.firstName?.trim()) {
      const productAction = this.currentContract.employeeId
        ? this.workContractsService.updateProduct(this.currentContract)
        : this.workContractsService.addProduct({
          ...this.currentContract,
          employeeId:
            this.currentContract.employeeId || this.createUniqueId(),
        });

      productAction.then(() => {

        this.cd.detectChanges();

        const actionMessage = this.currentContract.employeeId
          ? 'Product Updated'
          : 'Product Created';

        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: actionMessage,
          life: 3000,
        });

        this.resetProductDialog();
      });
    }
  }

  resetProductDialog() {
    this.productDialog = false;
    this.currentContract = {} as WorkContract;
    this.selectedProducts = [];
  }
}
