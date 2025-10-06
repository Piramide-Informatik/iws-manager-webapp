import { Component, OnInit, OnDestroy, inject, Input, OnChanges, SimpleChanges } from '@angular/core';
import { BehaviorSubject, Subscription, combineLatest, map, startWith, switchMap } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { Vat } from '../../../../../../Entities/vat';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { VatUtils } from '../../utils/vat-utils';
import { VatService } from '../../../../../../Services/vat.service';
import { VatStateService } from '../../utils/vat-state.service';
import { VatRateUtils } from '../../utils/vat-rate-utils';
import { Column } from '../../../../../../Entities/column';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-sales-tax-table',
  standalone: false,
  templateUrl: './sales-tax-table.component.html',
  styleUrl: './sales-tax-table.component.scss'
})
export class SalesTaxTableComponent implements OnInit, OnDestroy, OnChanges {
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly salesTaxUtils = inject(VatUtils);
  private readonly salestTaxService = inject(VatService);
  private readonly salesTaxStateService = inject(VatStateService);
  private readonly vatRateUtils = inject(VatRateUtils);
  @Input() isEdited: boolean = false;
  @Input() vatRateIsEdited: boolean = false;
  salesTaxesColumns: Column[] = [];
  isSalesTaxesChipVisible = false;
  userSalesTaxTablePreferences: UserPreference = {};
  tableKey: string = 'SalesTaxTable'
  dataKeys = ['label', 'rate'];
  public modalType: 'create' | 'delete' = 'create';
  public isVisibleModal: boolean = false;

  private readonly refreshTrigger$ = new BehaviorSubject<void>(undefined);
  private readonly refreshVatRates$ = new BehaviorSubject<void>(undefined);

  readonly salesTaxesValues$ = combineLatest([
    this.refreshTrigger$.pipe(
      startWith(undefined),
      switchMap(() => this.salestTaxService.getAllVats())
    ),
    this.refreshVatRates$.pipe(
      startWith(undefined),
      switchMap(() => this.vatRateUtils.getAllVatRates())
    )
  ]).pipe(
    map(([vats, vatRates]) => {
      const array = (vats ?? []).map(v => ({
        ...v,
        rate: this.vatRateUtils.calculateCurrentRateForVat(v, vatRates ?? [])
      }));
      return array;
    })
  );

  readonly salesTaxesValues = toSignal(this.salesTaxesValues$, { 
    initialValue: [] 
  });

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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['isEdited']){
      this.refreshTrigger$.next();
    }
    if(changes['vatRateIsEdited']){
      this.refreshVatRates$.next();
    }
  }

  onUserSalesTaxTablePreferencesChanges(userSalesTaxTablePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userSalesTaxTablePreferences));
  }

  loadSalesTaxHeadersAndColumns() {
    this.salesTaxesColumns = this.loadColumnSalesTaxHeaders();
  }

  loadColumnSalesTaxHeaders(): Column[] {
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
      const foundVat = this.salesTaxesValues().find(st => st.id === event.data);
      if (foundVat) {
        this.selectedVat = {
          id: foundVat.id,
          createdAt: foundVat.createdAt,
          updatedAt: foundVat.updatedAt,
          version: foundVat.version,
          label: foundVat.label
        };
      }
    }
    this.isVisibleModal = true;
  }


  onCreateVat(event: { created?: Vat, status: 'success' | 'error' }): void {
    if (event.created && event.status === 'success') {
      this.refreshTrigger$.next()
      this.commonMessageService.showCreatedSuccesfullMessage();
    } else if (event.status === 'error') {
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  onDeleteVat(event: { status: 'success' | 'error', error?: Error }): void {
    if (event.status === 'success') {
      this.refreshTrigger$.next()
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
