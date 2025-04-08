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
  productDialog: boolean = false;
  currentContract!: WorkContract;
  contracts: WorkContract[] = [];
  selectedProducts: WorkContract[] | null | undefined;
  submitted: boolean = true;
  searchTerm: string = '';
  statuses!: any[];

  @ViewChild('dt') dt!: Table;

  loading: boolean = true;
  cols: Column[] = [
    { field: 'employeeId', header: 'Employee ID' },
    { field: 'firstName', header: 'First Name' },
    { field: 'lastName', header: 'Last Name' },
    { field: 'date', header: 'Date' },
    { field: 'salary', header: 'Salary' },
    { field: 'weeklyHours', header: 'Weekly Hours' },
    { field: 'maxHrsDay', header: 'Max Hrs/Day' },
    { field: 'maxHrsMonth', header: 'Max Hrs/Month' },
    { field: 'abbreviation', header: 'Abbreviation' },
    { field: 'hourlyRate', header: 'Hourly Rate' },
    { field: 'noteLine', header: 'Note Line' },
  ];

  exportColumns!: ExportColumn[];
  constructor(
    private workContractsService: WorkContractsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.workContractsService
      .list()
      .then((data) => {
        console.log('Datos cargados:', data);
        this.contracts = data || [];
        this.loading = false;

        this.cd.detectChanges();
      })
      .catch((error) => {
        console.error('Error al cargar los contratos:', error);
      });
  }
  exportCSV() {
    if (this.contracts && this.contracts.length) {
      setTimeout(() => {
        if (this.dt && this.dt.exportCSV) {
          this.dt.exportCSV();
        } else {
          console.error('La tabla no tiene el método exportCSV disponible');
        }
      }, 0);
    } else {
      console.error('No hay datos para exportar');
    }
  }
  loadWorkContracts() {
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

  editProduct(currentContract: WorkContract) {
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
  deleteProduct(product: WorkContract) {
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
      this.dt.filter(inputElement.value, field, 'contains');
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
        this.loadProducts();

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

  loadProducts() {
    this.workContractsService.list().then((data) => {
      this.contracts = data;
    });
  }

  resetProductDialog() {
    this.productDialog = false;
    this.currentContract = {} as WorkContract;
    this.selectedProducts = [];
  }
}
