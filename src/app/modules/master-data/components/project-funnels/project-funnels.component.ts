import { Component } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

@Component({
  selector: 'app-project-funnels',
  standalone: false,
  templateUrl: './project-funnels.component.html',
  styles: ``
})
export class ProjectFunnelsComponent {

  public projectFunnels: any[] = [];
  columsHeaderFieldProjecFunnels: any[] = [];
  userProjectFunnelsPreferences: UserPreference = {};
  tableKey: string = 'ProjectFunnels'
  dataKeys = ['id','projectSponsor'];

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.projectFunnels = this.masterDataService.getProjectFunnelsData();

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
      { field: 'projectSponsor', styles: {'width': 'auto'},  header: this.translate.instant(_('PROJECT_FUNNELS.TABLE.PROJECT_SPONSOR')) },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
