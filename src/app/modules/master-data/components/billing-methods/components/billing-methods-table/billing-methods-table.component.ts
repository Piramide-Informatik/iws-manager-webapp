import { Component, ViewChild, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { InvoiceType } from '../../../../../../Entities/invoiceType';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { InvoiceTypeUtils } from '../../utils/invoice-type-utils';
import { InvoiceTypeService } from '../../../../../../Services/invoice-type.service';

@Component({
  selector: 'app-billing-methods-table',
  standalone: false,
  templateUrl: './billing-methods-table.component.html',
  styleUrl: './billing-methods-table.component.scss'
})
export class BillingMethodsTableComponent implements OnInit, OnDestroy {

  private readonly billingMethodUtils = inject(InvoiceTypeUtils);
  private readonly billingMethodService = inject(InvoiceTypeService);
  billingMethodColumns: any[] = [];
  userBillingMethodsPreferences: UserPreference = {};
  tableKey: string = 'BillingMethods'
  dataKeys = ['name'];
  private readonly commonMessageService = inject(CommonMessagesService);
  public modalType: 'create' | 'delete' = 'create';
  public visibleModal: boolean = false;

  @ViewChild('dt') dt!: Table;

  private langBillingMethodsSubscription!: Subscription;
  readonly billingMethodsValues = computed(() => {
    return this.billingMethodService.invoiceTypes();
  });

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService, 
              private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.billingMethodUtils.loadInitialData().subscribe();
    this.loadBillingMethodsHeadersAndColumns();
    this.userBillingMethodsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.billingMethodColumns);
    this.langBillingMethodsSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadBillingMethodsHeadersAndColumns();
      this.userBillingMethodsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.billingMethodColumns);
    });
  }

  onUserBillingMethodsPreferencesChanges(userBillingMethodsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userBillingMethodsPreferences));
  }

  loadBillingMethodsHeadersAndColumns() {
    this.billingMethodColumns = this.loadBillingMethodsHeaders();;
  }

  loadBillingMethodsHeaders(): any[] {
    return [
      {
        field: 'name',
        minWidth: 110,
        header: this.translate.instant(_('BILLING_METHODS.TABLE_BILLING_METHODS.BILLING_TYPE'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langBillingMethodsSubscription) {
      this.langBillingMethodsSubscription.unsubscribe();
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    
    this.visibleModal = true;
  }

  onCreateInvoiceType(event: { created?: InvoiceType, status: 'success' | 'error'}): void {
    if(event.created && event.status === 'success'){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.status === 'error'){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }
}
