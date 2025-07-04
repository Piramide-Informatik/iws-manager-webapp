import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Invoice } from '../../../../Entities/invoices';
import { InvoicesService } from '../../services/invoices.service';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import {TranslateService, _} from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  customClasses?: string[];
  routerLink?: (row: any) => string
}

interface ExportColumn {
  title: string;
  dataKey: string;
}

@Component({
  selector: 'app-list-invoices',
  standalone: false,
  providers: [MessageService, ConfirmationService, InvoicesService],
  templateUrl: './list-invoices.component.html',
  styleUrl: './list-invoices.component.scss',
})
export class ListInvoicesComponent implements OnInit, OnDestroy{
  public cols!: Column[];

  private langSubscription!: Subscription;

  public selectedColumns!: Column[];

  public customer!: string;
  productDialog: boolean = false;
  currentInvoice!: Invoice;
  public invoices: Invoice[] = [];
  selectedProducts: Invoice[] | null | undefined;

  submitted: boolean = true;
  searchTerm: string = '';
  statuses!: any[];
  userInvoicePreferences: UserPreference = {};
  tableKey: string = 'Invoice'
  dataKeys = ['invoiceNumber', 'date', 'description', 'type', 'iwsNumber', 'orderNumber', 'orderName', 'netAmount', 'value', 'totalAmount'];


  @ViewChild('dt2') dt2!: Table;

  loading: boolean = true;

  exportColumns!: ExportColumn[];
  constructor(
    private readonly invoicesService: InvoicesService,
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly cd: ChangeDetectorRef,
    private readonly translate: TranslateService, 
    private readonly router:Router
  ) {}

  ngOnInit():void {
    this.loadInvoiceColHeaders();
    this.selectedColumns = this.cols;
    this.customer = 'Joe Doe';

    this.invoices = this.invoicesService.list();
    this.userInvoicePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadInvoiceColHeaders();
      this.reloadComponent(true);
      this.userInvoicePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });

    this.selectedColumns = this.cols;
  }

  onUserInvoicePreferencesChanges(userInvoicePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userInvoicePreferences));
  }

  loadInvoiceColHeaders(): void {
    this.cols = [
          { 
            field: 'invoiceNumber', 
            customClasses: ['align-right'], 
            routerLink: (row: any) => `./invoice-details/${row.invoiceNumber}`,
            header:  this.translate.instant(_('INVOICES.TABLE.INVOICE_NUMBER'))
          },
          { field: 'date', customClasses: ['text-center'], header: this.translate.instant(_('INVOICES.TABLE.INVOICE_DATE'))},
          { field: 'description', header: this.translate.instant(_('INVOICES.TABLE.DESCRIPTION'))},
          { field: 'type', header: this.translate.instant(_('INVOICES.TABLE.INVOICE_TYPE'))},
          { field: 'iwsNumber', header: this.translate.instant(_('INVOICES.TABLE.NETWORK'))},
          { field: 'orderNumber', header: this.translate.instant(_('INVOICES.TABLE.ORDER_NUMBER'))},
          { field: 'orderName', header: this.translate.instant(_('INVOICES.TABLE.ORDER_TITLE'))},
          { field: 'netAmount', customClasses: ['align-right'],  header: this.translate.instant(_('INVOICES.TABLE.NET_AMOUNT'))},
          { field: 'value', customClasses: ['align-right'], header: this.translate.instant(_('INVOICES.TABLE.TAX_AMOUNT'))},
          { field: 'totalAmount', customClasses: ['align-right'], header: this.translate.instant(_('INVOICES.TABLE.AMOUNT_GROSS'))}
        ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  reloadComponent(self:boolean,urlToNavigateTo ?:string){
   const url=self ? this.router.url :urlToNavigateTo;
   this.router.navigateByUrl('/',{skipLocationChange:true}).then(()=>{
     this.router.navigate([`/${url}`]).then(()=>{
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
    if (this.invoices?.length) {
      setTimeout(() => {
        if (this.dt2?.exportCSV) {
          this.dt2.exportCSV();
        } else {
          console.error('Exportación no disponible');
        }
      }, 0);
    } else {
      console.error('No hay datos para exportar');
    }
  }

  editInvoice(currentInvoice: Invoice) {
    this.currentInvoice = { ...currentInvoice };
    this.productDialog = true;
  }

  deleteSelectedProducts() {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete the selected products?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.invoices = this.invoices.filter(
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
  deleteInvoice(invoiceNumber: number) {
    this.confirmationService.confirm({
      message: 'Are you sure you want to delete ' + invoiceNumber + '?',
      header: 'Confirm',
      icon: 'pi pi-exclamation-triangle',
      accept: () => {
        this.invoicesService.deleteInvoice(invoiceNumber);
        this.invoices = this.invoices.filter(
          (val) => val.id !== invoiceNumber
        );
        this.messageService.add({
          severity: 'success',
          summary: 'Successful',
          detail: 'Invoice Deleted',
          life: 3000,
        });
      },
    });
  }

  findIndexById(id: number): number {
    return this.invoices.findIndex(
      (currentInvoice) => currentInvoice.invoiceNumber === id.toString()
    );
  }

  createUniqueId(): number {
    let id: number;
    const array = new Uint32Array(1);
    do {
      crypto.getRandomValues(array);
      id = array[0] % 1000;
    } while (
      this.invoices.some(
        (currentInvoice) => currentInvoice.invoiceNumber === id.toString()
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

  saveProduct() {
    this.submitted = true;

    if (this.currentInvoice.description?.trim()) {
      const productAction = this.currentInvoice.invoiceNumber
        ? this.invoicesService.updateProduct(this.currentInvoice)
        : this.invoicesService.addProduct({
            ...this.currentInvoice,
            invoiceNumber:
              this.currentInvoice.invoiceNumber ||
              this.createUniqueId().toString(),
          });

      productAction.then(() => {
        this.cd.detectChanges();

        const actionMessage = this.currentInvoice.invoiceNumber
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
    this.currentInvoice = {} as Invoice;
    this.selectedProducts = [];
  }
}
