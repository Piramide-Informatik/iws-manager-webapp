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
  products: WorkContract[] = [];

  product!: WorkContract;
  selectedProducts!: WorkContract[] | null;
  submitted: boolean = true;

  statuses!: any[];

  @ViewChild('dt') dt!: Table;

  loading: boolean = true;
  cols!: Column[];

  exportColumns!: ExportColumn[];
  constructor(
    private workContractsService: WorkContractsService,
    private messageService: MessageService,
    private confirmationService: ConfirmationService,
    private cd: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.workContractsService.list().then((data) => {
      this.products = data;
      this.loading = false;
    });
  }
  exportCSV() {
    this.dt.exportCSV();
  }

  loadWorkContracts() {
    this.workContractsService.list().then((contracts) => {
      this.products = contracts;
      this.loading = false;
    });
  }

  openNew() {
    this.product, (this.submitted = false);
    this.productDialog = true;
  }

  editProduct(product: WorkContract) {
    this.product = { ...product };
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(
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
    this.product; // Resetea el producto al cerrar el diálogo
  }
  deleteProduct(product: WorkContract) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + product.firstName + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.products = this.products.filter(
          (val) => val.employeeId !== product.employeeId
        );
        this.product;
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
    return this.products.findIndex((product) => product.employeeId === id);
  }

  createUniqueId(): number {
    let id: number;
    do {
      id = Math.floor(Math.random() * 1000);
    } while (this.products.some((product) => product.employeeId === id)); // Verifica si ya existe un contrato con el mismo ID
    return id;
  }
  getSeverity(status: string) {
    if (status === 'Active') {
      return 'success';
    }
    if (status === 'Pending') {
      return 'warning';
    }
    return 'info'; // Valor por defecto
  }

  onInputChange(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement && inputElement.value) {
      this.dt.filterGlobal(inputElement.value, 'contains');
    }
  }

  saveProduct() {
    this.submitted = true;

    if (this.product.firstName?.trim()) {
      if (this.product.employeeId) {
        this.products[this.findIndexById(this.product.employeeId)] =
          this.product;
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Updated',
          life: 3000,
        });
      } else {
        this.product.employeeId = this.createUniqueId();

        this.products.push(this.product);
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Product Created',
          life: 3000,
        });
      }

      this.products = [...this.products];
      this.productDialog = false;
      this.product = {} as WorkContract;
    }
  }
}
