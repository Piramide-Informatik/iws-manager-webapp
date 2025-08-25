import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { CostTypeUtils } from '../../utils/cost-type-utils';
import { CostTypeService } from '../../../../../../Services/cost-type.service';

@Component({
  selector: 'app-costs-table',
  standalone: false,
  templateUrl: './costs-table.component.html',
  styleUrl: './costs-table.component.scss',
})
export class CostsTableComponent implements OnInit, OnDestroy {
  private readonly costTypeUtils = new CostTypeUtils();
  private readonly costTypeService = inject(CostTypeService)
  columnsHeaderFieldCosts: any[] = [];
  userCostTablePreferences: UserPreference = {};
  tableKey: string = 'CostTable'
  dataKeys = ['name', 'sort'];
  private langSubscription!: Subscription;

  readonly costsUI = computed(() => {
    return this.costTypeService.costTypes().map(cost => ({
      id: cost.id,
      name: cost.type,
      sort: cost.sequenceNo
    }));
  });

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ) {}

  ngOnInit(): void {
    this.costTypeUtils.loadInitialData().subscribe()
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
