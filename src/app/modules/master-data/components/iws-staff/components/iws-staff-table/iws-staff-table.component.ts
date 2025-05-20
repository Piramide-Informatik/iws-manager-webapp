import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'app-iws-staff-table',
  templateUrl: './iws-staff-table.component.html',
  standalone: false,
  styles: ``,
})
export class IwsStaffTableComponent implements OnInit, OnDestroy {
  iwsStaff: any[] = [];
  columnsHeaderFieldIwsStaff: any[] = [];
  userIwsStaffTPreferences: UserPreference = {};
  tableKey: string = 'IwsStaffT'
  dataKeys = ['type', 'abbreviation', 'firstName', 'lastName', 'email'];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
  ngOnInit(): void {
    this.iwsStaff = [
      {
        id: 1,
        abbreviation: 'PaZe',
        firstName: 'Patrick',
        lastName: 'Zessin',
        email: 'p.zessin@iws-nord.de',
      },
      {
        id: 2,
        abbreviation: 'PhiG',
        firstName: 'Philipp',
        lastName: 'Glöckner',
        email: 'p.glockner@iws-nord.de',
      },
      {
        id: 3,
        abbreviation: 'MilZ',
        firstName: 'Miljan',
        lastName: 'Zekovic',
        email: 'm.zekovic@iws-nord.de',
      },
      {
        id: 4,
        abbreviation: 'LoSc',
        firstName: 'Lothar',
        lastName: 'Schulte',
        email: 'l.schulte@iws-nord.de',
      },
      {
        id: 5,
        abbreviation: 'KWe',
        firstName: 'Kai',
        lastName: 'Wellmann',
        email: 'k.wellmann@iws-nord.de',
      },
      {
        id: 6,
        abbreviation: 'GeKa',
        firstName: 'Gernot',
        lastName: 'Karten',
        email: 'g.karten@iws-nord.de',
      },
    ];

    this.loadColHeadersIwsStaff();
    this.userIwsStaffTPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldIwsStaff);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersIwsStaff();
      this.routerUtils.reloadComponent(true);
      this.userIwsStaffTPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldIwsStaff);
    });
  }

  onUserIwsStaffTPreferencesChanges(userIwsStaffTPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsStaffTPreferences));
  }

  loadColHeadersIwsStaff(): void {
    this.columnsHeaderFieldIwsStaff = [
      {
        field: 'abbreviation',
        styles: { width: '100px' },
        header: this.translate.instant(_('IWS_STAFF.TABLE.SHORT_NAME')),
      },
      {
        field: 'firstName',
        styles: { width: '150px' },
        header: this.translate.instant(_('IWS_STAFF.TABLE.FIRST_NAME')),
      },
      {
        field: 'lastName',
        styles: { width: '150px' },
        header: this.translate.instant(_('IWS_STAFF.TABLE.LAST_NAME')),
      },
      {
        field: 'email',
        styles: { width: 'auto' },
        header: this.translate.instant(_('IWS_STAFF.TABLE.EMAIL')),
      },
    ];
  }
}
