import { ChangeDetectorRef, Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Invoice } from '../../../../Entities/invoices';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription, take } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { InvoiceUtils } from '../../utils/invoice.utils';
import { Column } from '../../../../Entities/column';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { Title } from '@angular/platform-browser';
import { CustomerStateService } from '../../../customer/utils/customer-state.service';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { Customer } from '../../../../Entities/customer';

@Component({
  selector: 'app-list-invoices',
  standalone: false,
  providers: [MessageService, ConfirmationService],
  templateUrl: './list-invoices.component.html',
  styleUrl: './list-invoices.component.scss',
})
export class ListInvoicesComponent implements OnInit, OnDestroy {
  public cols!: Column[];
  private readonly invoiceUtils = inject(InvoiceUtils);
  private readonly titleService = inject(Title);
  private readonly customerStateService = inject(CustomerStateService);
  private readonly customerUtils = inject(CustomerUtils);

  private langSubscription!: Subscription;

  public selectedColumns!: Column[];

  public customer!: string;
  productDialog: boolean = false;
  currentInvoice!: Invoice;
  public invoices: any[] = [];
  selectedProducts: Invoice[] | null | undefined;

  submitted: boolean = true;
  searchTerm: string = '';
  statuses!: any[];
  userInvoicePreferences: UserPreference = {};
  tableKey: string = 'Invoice'
  dataKeys = ['invoiceNumber', 'date', 'description', 'type', 'iwsNumber', 'orderNumber', 'orderName', 'netAmount', 'value', 'totalAmount'];

  visibleInvoicesModal = false;

  isInvoicesLoading = false;
  public currentCustomer!: Customer | undefined;
  selectedInvoices!: any;

  @ViewChild('dt2') dt2!: Table;

  loading: boolean = true;

  constructor(
    private readonly messageService: MessageService,
    private readonly confirmationService: ConfirmationService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly cd: ChangeDetectorRef,
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly route: ActivatedRoute,
    private readonly commonMessage: CommonMessagesService
  ) { }

  ngOnInit(): void {
    this.loadInvoiceColHeaders();
    this.selectedColumns = this.cols;
    this.userInvoicePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadInvoiceColHeaders();
      this.reloadComponent(true);
      this.userInvoicePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
    this.route.params.subscribe(params => {
      const customerId = params['id'];
      if (!customerId) {
        this.updateTitle('...');
        return;
      }

      this.customerStateService.currentCustomer$.pipe(take(1)).subscribe(currentCustomer => {
        if (currentCustomer) {
          this.updateTitle(currentCustomer.customername1!);
        } else {
          this.getTitleByCustomerId(customerId);
        }
      })

      this.invoiceUtils.getAllInvoicesByCustomerId(params['id']).subscribe(invoices => {
        this.invoices = invoices.reduce((acc: any[], curr) => {
          acc.push({
            id: curr.id,
            invoiceNumber: curr.invoiceNo,
            date: curr.invoiceDate,
            description: curr.note,
            type: curr.invoiceType,
            iwsNumber: curr.network,
            orderNumber: curr.order?.orderNo,
            orderName: curr.order?.orderLabel,
            netAmount: curr.amountNet,
            value: curr.amountTax,
            totalAmount: curr.amountGross
          });
          return acc;
        }, []);
      })
    })
  }

  private getTitleByCustomerId(customerId: number): void {
    this.customerUtils.getCustomerById(customerId).subscribe(customer => {
      if (customer) {
        this.updateTitle(customer.customername1!);
        this.currentCustomer = customer;
      } else {
        this.updateTitle('');
      }
    });
  }

  openDeleteModal(id: any) {
    this.visibleInvoicesModal = true;
    const invoices = this.invoices.find(invoices => invoices.id == id);
    if (invoices) {
      this.selectedInvoices = invoices;
    }
  }

  onInvoicesDelete() {
    if (this.selectedInvoices) {
      this.isInvoicesLoading = true;
      this.invoiceUtils.deleteInvoice(this.selectedInvoices.id).subscribe({
        next: () => {
          this.commonMessage.showDeleteSucessfullMessage();
          this.invoices = this.invoices.filter(invoices => invoices.id != this.selectedInvoices.id);
        },
        error: () => {
          this.commonMessage.showErrorDeleteMessage();
        },
        complete: () => {
          this.visibleInvoicesModal = false;
          this.selectedInvoices = undefined;
          this.isInvoicesLoading = false;
        }
      })
    }
  }

  onUserInvoicePreferencesChanges(userInvoicePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userInvoicePreferences));
  }

  loadInvoiceColHeaders(): void {
    this.cols = [
      {
        field: 'invoiceNumber',
        customClasses: ['align-right', 'date-font-style'],
        routerLink: (row: any) => `./invoice-details/${row.invoiceNumber}`,
        header: this.translate.instant(_('INVOICES.TABLE.INVOICE_NUMBER'))
      },
      { field: 'date', type: 'date', customClasses: ['text-center'], header: this.translate.instant(_('INVOICES.TABLE.INVOICE_DATE')) },
      { field: 'description', header: this.translate.instant(_('INVOICES.TABLE.DESCRIPTION')) },
      { field: 'type.name', header: this.translate.instant(_('INVOICES.TABLE.INVOICE_TYPE')) },
      { field: 'iwsNumber', header: this.translate.instant(_('INVOICES.TABLE.NETWORK')) },
      { field: 'orderNumber', customClasses: ['align-right', 'date-font-style'], header: this.translate.instant(_('INVOICES.TABLE.ORDER_NUMBER')) },
      { field: 'orderName', header: this.translate.instant(_('INVOICES.TABLE.ORDER_TITLE')) },
      { field: 'netAmount', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('INVOICES.TABLE.NET_AMOUNT')) },
      { field: 'value', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('INVOICES.TABLE.TAX_AMOUNT')) },
      { field: 'totalAmount', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('INVOICES.TABLE.AMOUNT_GROSS')) }
    ];
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(
      `${this.translate.instant('PAGETITLE.CUSTOMER')} ${name} ${this.translate.instant('PAGETITLE.CUSTOMERS.INVOICES')}`
    );
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
        this.invoiceUtils.deleteInvoice(invoiceNumber);
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

    if (this.currentInvoice.note?.trim()) {
      const productAction = this.currentInvoice.invoiceNo
        ? this.invoiceUtils.updateInvoice(this.currentInvoice)
        : this.invoiceUtils.createNewInvoice({
          ...this.currentInvoice
        });

      productAction.subscribe(() => {
        this.cd.detectChanges();

        const actionMessage = this.currentInvoice.invoiceNo
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
