import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { CountryService } from '../../../../../../Services/country.service';
import { CountryUtils } from '../../utils/country-util';


@Component({
  selector: 'app-countries-table',
  standalone: false,
  templateUrl: './countries-table.component.html',
  styles: ``,
})
export class CountriesTableComponent implements OnInit, OnDestroy {
  private readonly countryUtils = new CountryUtils();
  private readonly countryService = inject(CountryService);
  
  columnsHeaderFieldCoutries: any[] = [];
  userCountriesPreferences: UserPreference = {};
  tableKey: string = 'Countries'
  dataKeys = ['name', 'abbreviation', 'isStandard'];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {

    this.loadColumnsCountries();
    this.userCountriesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCoutries);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumnsCountries();
      this.routerUtils.reloadComponent(true);
      this.userCountriesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCoutries);
    });
  }

  readonly countries = computed(() => {
    return this.countryService.countries().map(country => ({
      id: country.id,
      name: country.name,  
      abbreviation: country.label,
      isStandard: country.isDefault
    }));
  });

  onUserCountriesPreferencesChanges(userCountriesPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userCountriesPreferences));
  }

  loadColumnsCountries(): void {
    this.columnsHeaderFieldCoutries = [
      {
        field: 'name',
        header: this.translate.instant(_('COUNTRIES.TABLE.NAME')),
        styles: { width: 'auto' },
      },
      {
        field: 'abbreviation',
        header: this.translate.instant(_('COUNTRIES.TABLE.ABBREVIATION')),
        styles: { width: '120px' },
      },
      {
        field: 'isStandard',
        header: this.translate.instant(_('COUNTRIES.TABLE.IS_STANDARD')),
        styles: { width: '140px' },
      },
    ];
  }

  editCountry(country: any): void {
    console.log('Editing country:', country);
  }

  deleteCountry(id: number): void {
    console.log('Deleting country ID:', id);
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
