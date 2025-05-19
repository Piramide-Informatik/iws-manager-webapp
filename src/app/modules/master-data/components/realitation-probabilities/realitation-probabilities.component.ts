import { Component } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

@Component({
  selector: 'app-realitation-probabilities',
  standalone: false,
  templateUrl: './realitation-probabilities.component.html',
  styles: ``
})
export class RealitationProbabilitiesComponent {
  public probabilities: any[] = [];
  public columsHeaderFieldProbabilities: any[] = [];
  userRealitationProbabilitiesPreferences: UserPreference = {};
  tableKey: string = 'RealitationProbabilities'
  dataKeys = ['realizationProbabilities'];

  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.probabilities = this.masterDataService.getRealizationProbabilitiesData();

    this.loadColHeadersProbabilities();
    this.userRealitationProbabilitiesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProbabilities);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersProbabilities();
      this.routerUtils.reloadComponent(true);
      this.userRealitationProbabilitiesPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProbabilities);
    });
  }

  onUserRealitationProbabilitiesPreferencesChanges(userRealitationProbabilitiesPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userRealitationProbabilitiesPreferences));
  }
  
  loadColHeadersProbabilities(): void {
    this.columsHeaderFieldProbabilities = [
      { field: 'realizationProbabilities', styles: {'width': 'auto'}, header: this.translate.instant(_('SIDEBAR.REALIZATION_PROBABILITIES')) },
    ];
  }
  
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
