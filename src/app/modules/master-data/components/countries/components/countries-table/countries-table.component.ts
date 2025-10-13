import { Component, OnInit, OnDestroy, inject, computed, ViewChild } from '@angular/core';
import { Subject, Subscription, takeUntil } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { CountryService } from '../../../../../../Services/country.service';
import { CountryUtils } from '../../utils/country-util';
import { Country } from '../../../../../../Entities/country';
import { CountryStateService } from '../../utils/country-state.service';
import { CountryModalComponent } from '../country-modal/country-modal.component';
import { MessageService } from 'primeng/api';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-countries-table',
  standalone: false,
  templateUrl: './countries-table.component.html',
  styles: ``,
})
export class CountriesTableComponent implements OnInit, OnDestroy {
  private readonly countryUtils = new CountryUtils();
  private readonly countryService = inject(CountryService);
  private readonly destroy$ = new Subject<void>();
  private readonly messageService = inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedCountry: number | null = null;
  CountryName: string = '';
  @ViewChild('countryModal') countryModalComponent!: CountryModalComponent;

  columnsHeaderFieldCoutries: any[] = [];
  userCountriesPreferences: UserPreference = {};
  tableKey: string = 'Countries'
  dataKeys = ['name', 'label', 'isDefault'];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly countryStateService: CountryStateService,
    private readonly commonMessageService: CommonMessagesService
  ) { }

  ngOnInit(): void {

    this.loadColumnsCountries();
    this.userCountriesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCoutries);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumnsCountries();
      this.userCountriesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCoutries);
    });
    this.countryService.loadInitialData().pipe(
      takeUntil(this.destroy$)
    ).subscribe();
  }

  readonly countries = computed(() => {
    return this.countryService.countries();
  });

  @ViewChild('countryModal') dialog!: CountryModalComponent;

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedCountry = event.data;

      this.CountryName = this.countries()?.find(country => country.id === this.selectedCountry)?.name ?? '';
    }
    this.visibleModal = true;
  }

  onUserCountriesPreferencesChanges(userCountriesPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userCountriesPreferences));
  }

  loadColumnsCountries(): void {
    this.columnsHeaderFieldCoutries = [
      {
        field: 'name',
        header: this.translate.instant(_('COUNTRIES.TABLE.NAME')),
        styles: { width: '120px' },
        useSameAsEdit: true
      },
      {
        field: 'label',
        header: this.translate.instant(_('COUNTRIES.TABLE.ABBREVIATION')),
        styles: { width: '120px' },
      },
      {
        field: 'isDefault',
        filter: {
          type: 'boolean'
        },
        header: this.translate.instant(_('COUNTRIES.TABLE.IS_STANDARD')),
        styles: { width: '140px' },
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    this.destroy$.next();
    this.destroy$.complete();
  }
   onVisibleModal(visible: boolean){
    this.visibleModal = visible;
  }
  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedCountry = null;
    }
  }
  editCountry(country: Country) {
    this.countryStateService.setCountryToEdit(country);
  }

  onDialogShow() {
    if (this.modalType === 'create' && this.countryModalComponent) {
      this.countryModalComponent.focusInputIfNeeded();
    }
  }

  onConfirmDelete(message: {severity: string, summary: string, detail: string}): void {
    if (message.severity === 'success') {
      this.countryStateService.clearCountry();
      this.commonMessageService.showDeleteSucessfullMessage()
    }
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }
  onModalCountriesClose() {
    if (this.dialog) {
      this.dialog.closeModal();
    }
  }
}
