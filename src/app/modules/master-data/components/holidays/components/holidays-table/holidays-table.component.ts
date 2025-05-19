import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { MasterDataService } from '../../../../master-data.service';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'app-holidays-table',
  standalone: false,
  templateUrl: './holidays-table.component.html',
  styleUrls: ['./holidays-table.component.scss'],
})
export class HolidaysTableComponent implements OnInit, OnDestroy {
  holidayUI: any[] = [];
  columnsHeaderFieldHoliday: any[] = [];
  userHolidaysPreferences: UserPreference = {};
  tableKey: string = 'Holidays'
  dataKeys = ['sort', 'name'];
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.holidayUI = [
      { id: 1, sort: 1, name: 'Neujahr' },
      { id: 2, sort: 2, name: 'Heilige Drei Könige' },
      { id: 3, sort: 3, name: 'Rosenmontag' },
      { id: 4, sort: 4, name: 'Internationaler Frauentag' },
      { id: 5, sort: 5, name: 'Gründonnerstag' },
      { id: 6, sort: 6, name: 'Karfreitag' },
      { id: 7, sort: 7, name: 'Ostersonntag' },
      { id: 8, sort: 8, name: 'Ostermontag' },
      { id: 9, sort: 9, name: 'Tag der Arbeit' },
      { id: 10, sort: 10, name: 'Christi Himmelfahrt' },
      { id: 11, sort: 11, name: 'Pfingstmontag' },
      { id: 12, sort: 12, name: 'Fronleichnam' },
    ];

    this.loadColHeadersHoliday();
    this.userHolidaysPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldHoliday);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersHoliday();
      this.routerUtils.reloadComponent(true);
      this.userHolidaysPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldHoliday);
    });
  }

  onUserHolidaysPreferencesChanges(userHolidaysPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userHolidaysPreferences));
  }

  loadColHeadersHoliday(): void {
    this.columnsHeaderFieldHoliday = [
      {
        field: 'sort',
        styles: { width: '100px' },
        header: this.translate.instant(_('HOLIDAYS.TABLE.SORT')),
      },
      {
        field: 'name',
        styles: { width: 'auto' },
        header: this.translate.instant(_('HOLIDAYS.TABLE.NAME')),
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
