import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'app-countries-table',
  standalone: false,
  templateUrl: './countries-table.component.html',
  styles: ``,
})
export class CountriesTableComponent implements OnInit, OnDestroy {
  countries: any[] = [];
  columnsHeaderFieldCoutries: any[] = [];
  userPreferences: UserPreference = {};
  tableKey: string = 'Countries'
  dataKeys = ['name', 'abbreviation', 'isStandard'];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.countries = [
      { id: 1, name: 'Deutschland', abbreviation: 'D', isStandard: true },
      { id: 2, name: 'Niederlande', abbreviation: 'NL', isStandard: false },
      { id: 3, name: 'Österreich', abbreviation: 'A', isStandard: false },
      { id: 4, name: 'Schweiz', abbreviation: 'CH', isStandard: false },
    ];

    this.loadColumnsCountries();
    this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCoutries);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumnsCountries();
      this.routerUtils.reloadComponent(true);
      this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCoutries);
    });
  }

  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
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
