import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Invoice } from '../../../../Entities/invoices';
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
  templateUrl: './list-invoices.component.html',
  styleUrl: './list-invoices.component.scss',
})
export class ListInvoicesComponent implements OnInit, OnDestroy {
  private readonly invoiceUtils = inject(InvoiceUtils);
  private readonly titleService = inject(Title);
  private readonly customerStateService = inject(CustomerStateService);
  private readonly customerUtils = inject(CustomerUtils);
  
  private langSubscription!: Subscription;
  
  public cols!: Column[];
  public selectedColumns!: Column[];
  public invoices: Invoice[] = [];
  selectedInvoice!: Invoice | undefined;

  userInvoicePreferences: UserPreference = {};
  tableKey: string = 'Invoice'
  dataKeys = ['invoiceNo', 'invoiceDate', 'note', 'invoiceType', 'network', 'orderNo', 'orderLabel', 'amountNet', 'amountTax', 'amountGross'];

  visibleInvoicesModal = false;
  isLoadingDelete = false;
  private customerId = '';
  public currentCustomer!: Customer | undefined;
  @ViewChild('dt2') dt2!: Table;

  constructor(
    private readonly userPreferenceService: UserPreferenceService,
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
    this.customerId = this.route.snapshot.params['id'];

    if (!this.customerId) {
      this.updateTitle('...');
    }

    this.customerStateService.currentCustomer$.pipe(take(1)).subscribe(customer => {
      if (customer) {
        this.updateTitle(customer.customername1!);
        this.currentCustomer = customer;
      } else {
        this.getTitleByCustomerId(Number(this.customerId));
      }
    })

    this.invoiceUtils.getAllInvoicesByCustomerId(Number(this.customerId)).subscribe(invoices => {
      this.invoices = invoices
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
    const invoice = this.invoices.find(invoice => invoice.id == id);
    if (invoice) {
      this.selectedInvoice = invoice;
    }
  }

  onInvoicesDelete() {
    if (this.selectedInvoice) {
      this.isLoadingDelete = true;
      this.invoiceUtils.deleteInvoice(this.selectedInvoice.id).subscribe({
        next: () => {
          this.commonMessage.showDeleteSucessfullMessage();
          this.invoices = this.invoices.filter(invoices => invoices.id != this.selectedInvoice?.id);
        },
        error: () => {
          this.commonMessage.showErrorDeleteMessage();
        },
        complete: () => {
          this.visibleInvoicesModal = false;
          this.selectedInvoice = undefined;
          this.isLoadingDelete = false;
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
        field: 'invoiceNo',
        customClasses: ['align-right', 'date-font-style'],
        routerLink: (row: any) => `./invoice-details/${row.invoiceNo}`,
        header: this.translate.instant(_('INVOICES.TABLE.INVOICE_NUMBER'))
      },
      { field: 'invoiceDate', type: 'date', customClasses: ['text-center'], header: this.translate.instant(_('INVOICES.TABLE.INVOICE_DATE')) },
      { field: 'note', header: this.translate.instant(_('INVOICES.TABLE.DESCRIPTION')) },
      { field: 'invoiceType.name', header: this.translate.instant(_('INVOICES.TABLE.INVOICE_TYPE')) },
      { field: 'network.name', header: this.translate.instant(_('INVOICES.TABLE.NETWORK')) },
      { field: 'order.orderNo', customClasses: ['align-right', 'date-font-style'], header: this.translate.instant(_('INVOICES.TABLE.ORDER_NUMBER')) },
      { field: 'order.orderLabel', header: this.translate.instant(_('INVOICES.TABLE.ORDER_TITLE')) },
      { field: 'amountNet', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('INVOICES.TABLE.NET_AMOUNT')) },
      { field: 'amountTax', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('INVOICES.TABLE.TAX_AMOUNT')) },
      { field: 'amountGross', type: 'double', customClasses: ['align-right'], header: this.translate.instant(_('INVOICES.TABLE.AMOUNT_GROSS')) }
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
}
