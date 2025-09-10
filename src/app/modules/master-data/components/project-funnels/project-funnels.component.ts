import { Component, computed, inject } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { PromoterUtils } from './utils/promoter-utils';
import { PromoterService } from '../../../../Services/promoter.service';

@Component({
  selector: 'app-project-funnels',
  standalone: false,
  templateUrl: './project-funnels.component.html',
  styles: ``
})
export class ProjectFunnelsComponent {
  private readonly promoterUtils = inject(PromoterUtils);
  private readonly promoterService = inject(PromoterService);
  columsHeaderFieldProjecFunnels: any[] = [];
  userProjectFunnelsPreferences: UserPreference = {};
  tableKey: string = 'ProjectFunnels'
  dataKeys = ['id','projectPromoter'];

  private langSubscription!: Subscription;

  readonly projectFunnels = computed(() => {
    return this.promoterService.promoters();
  });

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.promoterUtils.loadInitialData().subscribe();
    this.loadColHeadersProjectFunnels();
    this.userProjectFunnelsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProjecFunnels);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersProjectFunnels();
      this.routerUtils.reloadComponent(true);
      this.userProjectFunnelsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProjecFunnels);
    });
  }

  onUserProjectFunnelsPreferencesChanges(userProjectFunnelsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectFunnelsPreferences));
  }

  loadColHeadersProjectFunnels(): void {
    this.columsHeaderFieldProjecFunnels = [
      { field: 'id', styles: {'width': 'auto'}, header: 'Nr', customClasses: ['align-right'] },
      { field: 'projectPromoter', styles: {'width': 'auto'},  header: this.translate.instant(_('PROJECT_FUNNELS.TABLE.PROJECT_SPONSOR')) },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
