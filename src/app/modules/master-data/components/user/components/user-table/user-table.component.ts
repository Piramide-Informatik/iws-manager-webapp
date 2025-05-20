import { Component } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { MasterDataService } from '../../../../master-data.service';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'app-user-table',
  templateUrl: './user-table.component.html',
  styles: ``,
  standalone: false,
})
export class UserTableComponent {
  public userUI: any[] = [];
  public columsHeaderFieldUser: any[] = [];
  userPreferences: UserPreference = {};
  tableKey: string = 'User'
  dataKeys = ['username', 'name', 'active'];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.userUI = [
      { username: 'loschu', name: 'Schulte Lothar', active: true },
      { username: 'paze', name: 'Zessin Patrick', active: true },
      { username: 'mariah', name: 'Hernandez Maria', active: false },
      { username: 'jdoe', name: 'Doe John', active: true },
    ];

    this.loadColHeadersUserUI();
    this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldUser);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersUserUI();
      this.routerUtils.reloadComponent(true);
      this.userPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldUser);
    });
  }

  onUserPreferencesChanges(userPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences));
  }

  loadColHeadersUserUI(): void {
    this.columsHeaderFieldUser = [
      {
        field: 'username',
        styles: { width: '150px' },
        header: this.translate.instant(_('USERS.TABLE.USERNAME')),
      },
      {
        field: 'name',
        styles: { width: 'auto' },
        header: this.translate.instant(_('USERS.TABLE.NAME')),
      },
      {
        field: 'active',
        styles: { width: '80px' },
        header: this.translate.instant(_('USERS.TABLE.ACTIVE')),
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
