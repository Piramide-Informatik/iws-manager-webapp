import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Subscription, combineLatest, map, take } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { Vat } from '../../../../../../Entities/vat';
import { VatRate } from '../../../../../../Entities/vatRate';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { VatUtils } from '../../utils/vat-utils';
import { VatService } from '../../../../../../Services/vat.service';
import { VatStateService } from '../../utils/vat-state.service';
import { VatRateUtils } from '../../utils/vat-rate-utils';

@Component({
  selector: 'app-sales-tax-table',
  standalone: false,
  templateUrl: './sales-tax-table.component.html',
  styleUrl: './sales-tax-table.component.scss'
})
export class SalesTaxTableComponent implements OnInit, OnDestroy {
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly salesTaxUtils = inject(VatUtils);
  private readonly salestTaxService = inject(VatService);
  private readonly salesTaxStateService = inject(VatStateService);
  private readonly vatRateUtils = inject(VatRateUtils);
  salesTaxesColumns: any[] = [];
  isSalesTaxesChipVisible = false;
  userSalesTaxTablePreferences: UserPreference = {};
  tableKey: string = 'SalesTaxTable'
  dataKeys = ['label', 'rate'];
  public modalType: 'create' | 'delete' = 'create';
  public isVisibleModal: boolean = false;

  readonly salesTaxesValues$ = combineLatest([
    this.salestTaxService.getAllVats(),
    this.vatRateUtils.getAllVatRates()
  ]).pipe(
    map(([vats, vatRates]) => {
      const array = (vats ?? []).map(v => ({
        ...v,
        rate: this.vatRateUtils.calculateCurrentRateForVat(v, vatRates ?? [])
      }));
      return array;
    })
  );


  selectedVat!: Vat;

  private langSalesTaxSubscription!: Subscription;

  constructor(private readonly userPreferenceService: UserPreferenceService,
    private readonly translate: TranslateService) { }

  ngOnInit() {
    this.salesTaxUtils.loadInitialData().subscribe();
    this.loadSalesTaxHeadersAndColumns();
    this.userSalesTaxTablePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salesTaxesColumns);
    this.langSalesTaxSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadSalesTaxHeadersAndColumns();
      this.userSalesTaxTablePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.salesTaxesColumns);
    });
    const salesTaxesRatesData: VatRate[] = [];
    const salesTaxesData: Vat[] = [];
  }

  onUserSalesTaxTablePreferencesChanges(userSalesTaxTablePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSalesTaxTablePreferences));
  }

  loadSalesTaxHeadersAndColumns() {
    this.salesTaxesColumns = this.loadColumnSalesTaxHeaders();
  }

  loadColumnSalesTaxHeaders(): any[] {
    return [
      {
        field: 'label',
        minWidth: 110,
        header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX.SALES_TAX')),
        useSameAsEdit: true
      },
      {
        field: 'rate',
        minWidth: 110,
        type: 'double',
        header: this.translate.instant(_('SALES_TAX.TABLE_SALES_TAX.CURRENT_TAX_RATE')),
        customClasses: ['align-right']
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.langSalesTaxSubscription) {
      this.langSalesTaxSubscription.unsubscribe();
    }
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;

    if (event.type === 'delete' && event.data != null) {
      this.salesTaxesValues$.pipe(take(1)).subscribe(salesTaxes => {
        const foundVat = salesTaxes.find(st => st.id === event.data);
        if (foundVat) {
          this.selectedVat = foundVat;
        }
        this.isVisibleModal = true;
      });
    } else {
      this.isVisibleModal = true;
    }
  }


  onCreateVat(event: { created?: Vat, status: 'success' | 'error' }): void {
    if (event.created && event.status === 'success') {
      this.commonMessageService.showCreatedSuccesfullMessage();
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onDeleteVat(event: { status: 'success' | 'error', error?: Error }): void {
    if (event.status === 'success') {
      this.salesTaxStateService.clearVat();
      this.commonMessageService.showDeleteSucessfullMessage();
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorDeleteMessage();
    }
  }

  onEditVat(vat: Vat): void {
    this.salesTaxStateService.setVatToEdit(vat);
  }
}
