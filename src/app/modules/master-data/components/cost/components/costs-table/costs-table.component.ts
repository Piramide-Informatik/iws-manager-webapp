import { Component, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

@Component({
  selector: 'app-costs-table',
  standalone: false,
  templateUrl: './costs-table.component.html',
  styleUrl: './costs-table.component.scss',
})
export class CostsTableComponent implements OnInit, OnDestroy {
  costsUI: any[] = [];
  columnsHeaderFieldCosts: any[] = [];
  userCostTablePreferences: UserPreference = {};
  tableKey: string = 'CostTable'
  dataKeys = ['name', 'sort'];
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.costsUI = [
      { id: 1, name: 'Personalkosten', sort: 1 },
      { id: 2, name: 'Personalpauschale', sort: 2 },
      { id: 3, name: 'Reisekosten', sort: 3 },
      { id: 4, name: 'Projektkosten', sort: 4 },
      { id: 5, name: 'Förderung extern', sort: 5 },
      { id: 6, name: 'Zuwendung Bund', sort: 6 },
      { id: 7, name: 'Kostenstelle A', sort: 7 },
      { id: 8, name: 'Kostenstelle B', sort: 8 },
      { id: 9, name: 'Sonstige Kosten', sort: 9 },
      { id: 10, name: 'QM Kosten', sort: 10 },
    ];

    this.loadColHeadersCost();
    this.userCostTablePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCosts);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersCost();
      this.routerUtils.reloadComponent(true);
      this.userCostTablePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCosts);
    });
  }

  onUserCostTablePreferencesChanges(userCostTablePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userCostTablePreferences));
  }

  loadColHeadersCost(): void {
    this.columnsHeaderFieldCosts = [
      {
        field: 'name',
        styles: { width: 'auto' },
        header: this.translate.instant(_('COSTS.TABLE.NAME')),
      },
      {
        field: 'sort',
        styles: { width: '100px' },
        header: this.translate.instant(_('COSTS.TABLE.SORT')),
        customClasses: ['align-right']
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
