import { ChangeDetectorRef, Component, OnInit, ViewChild } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { WorkContractsService } from '../../services/work-contracts.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { Table } from 'primeng/table';

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
export class ListWorkContractsComponent implements OnInit {

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


  exportColumns!: ExportColumn[];
  constructor(
    private workContractsService: WorkContractsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.selectedColumns = this.cols;
    this.customer = 'Valentin Laime';

    this.contracts = this.workContractsService.list();

    this.cols = [
      { field: 'employeeId', header: 'Pers.Nr.' },
      { field: 'firstName', header: 'Vorname' },
      { field: 'lastName', header: 'Nachname' },
      { field: 'startDate', header: 'Datum' },
      { field: 'salaryPerMonth', header: 'Gehalt' },
      { field: 'weeklyHours', header: 'WoStd' },
      { field: 'worksShortTime', header: 'Kurz' },
      { field: 'specialPayment', header: 'Max.Std Mon' },
      { field: 'maxHrspPerMonth', header: 'Max Std Tag' },
      { field: 'maxHrsPerDay', header: 'Std.Satz' },
      { field: 'hourlyRate', header: 'JaSoZa' }
    ];

    this.selectedColumns = this.cols;


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
  deleteWorkContract(product: WorkContract) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.firstName + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.contracts = this.contracts.filter(
          (val) => val.employeeId !== product.employeeId
        );
        this.currentContract;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Deleted',
          life: 3000,
        });
      },
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
