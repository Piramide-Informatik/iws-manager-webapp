import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { WorkContractsService } from '../../services/work-contracts.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
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
  currentContract!: WorkContract;
  public contracts: WorkContract[] = [];
  selectedProducts: WorkContract[] | null | undefined;
  submitted: boolean = true;
  searchTerm: string = '';
  statuses!: any[];

  @ViewChild('dt2') dt2!: Table;

  loading: boolean = true;

  private langSubscription!: Subscription;

  exportColumns!: ExportColumn[];
  constructor(
    private workContractsService: WorkContractsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private readonly cd: ChangeDetectorRef,
    private readonly translate: TranslateService,
    private readonly router: Router
  ) { }

  ngOnInit(): void {
    this.loadColHeaders();
    this.selectedColumns = this.cols;
    this.customer = 'Joe Doe';

    this.contracts = this.workContractsService.list();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });

    this.selectedColumns = this.cols;
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'employeeId', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.EMPLOYEE_ID'))},
      { field: 'firstName', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.FIRST_NAME'))},
      { field: 'lastName', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.LAST_NAME'))},
      { field: 'startDate', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.START_DATE'))},
      { field: 'salaryPerMonth',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SALARY_PER_MONTH'))},
      { field: 'weeklyHours',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WEEKLY_HOURS'))},
      { field: 'worksShortTime',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.WORK_SHORT_TIME'))},
      { field: 'specialPayment',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.SPECIAL_PAYMENT'))},
      { field: 'maxHrspPerMonth', header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_MONTH'))},
      { field: 'maxHrsPerDay',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.MAX_HOURS_PER_DAY'))},
      { field: 'hourlyRate',  header:  this.translate.instant(_('EMPLOYEE-CONTRACTS.TABLE.HOURLY_RATE'))},
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    //skipLocationChange:true means dont update the url to / when navigating
    //console.log("Current route I am on:",this.router.url);
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
        //console.log(`After navigation I am on:${this.router.url}`)
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
    if (this.contracts && this.contracts.length) {
      setTimeout(() => {
        if (this.dt2 && this.dt2.exportCSV) {
          this.dt2.exportCSV();
        } else {
          console.error('La tabla no tiene el método exportCSV disponible');
        }
      }, 0);
    } else {
      console.error('No hay datos para exportar');
    }
  }

  /**loadWorkContracts() {
    this.workContractsService
      .list()
      .then((data) => {
        console.log('Datos cargados:', data);
        this.contracts = data || [];
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error al cargar los contratos:', error);
      });
  }
  /** 
  openNew() {
    this.currentContract = {
      employeeId: 0,
      firstName: '',
      lastName: '',
      date: '',
      salary: 0,
      weeklyHours: 0,
      maxHrsDay: 0,
      maxHrsMonth: 0,
      abbreviation: '',
      hourlyRate: 0,
      noteLine: '',
    };
    this.submitted = false;
    this.productDialog = true;
  }
*/
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
    this.currentContract;
  }

  deleteWorkContract(workContract: WorkContract) {
     this.confirmationService.confirm({
      message: this.translate.instant(_('DIALOG.DELETE'), { value: workContract.employeeId }),
      header: this.translate.instant(_('DIALOG.CONFIRM_TITLE')),
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: this.translate.instant(_('DIALOG.ACCEPT_LABEL')),
      rejectLabel: this.translate.instant(_('DIALOG.REJECT_LABEL')),
      accept: () => {
        this.workContractsService.deleteWorkContract(workContract.employeeId);
        this.contracts = this.contracts.filter(
          (val) => val.employeeId !== workContract.employeeId
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

    goToWorkCOntractDetails(currentWContract: WorkContract) {
      this.router.navigateByUrl('/work-contracts/contractDetails', { state: { customer: "Joe Doe", workContract: currentWContract } });
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

  onInputChange(event: Event, field: string): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
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
        // this.loadProducts();

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

  /** 
  loadProducts() {
    this.workContractsService.list().then((data) => {
      this.contracts = data;
    });
  }
*/
  resetProductDialog() {
    this.productDialog = false;
    this.currentContract = {} as WorkContract;
    this.selectedProducts = [];
  }
}
