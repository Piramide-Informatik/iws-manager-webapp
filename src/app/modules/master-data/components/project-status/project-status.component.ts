import { Component, OnDestroy, OnInit } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../router-utils.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

@Component({
  selector: 'app-project-status',
  standalone: false,
  templateUrl: './project-status.component.html',
  styles: ``
})
export class ProjectStatusComponent implements OnInit, OnDestroy {
  public columsHeaderFieldProjects: any[] = [];
  userProjectStatusPreferences: UserPreference = {};
  tableKey: string = 'ProjectStatus'
  dataKeys = ['projectStatus'];

  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.loadColHeadersProjects();
    this.userProjectStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProjects);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersProjects();
      this.routerUtils.reloadComponent(true);
      this.userProjectStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProjects);
    });
  }

  onUserProjectStatusPreferencesChanges(userProjectStatusPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectStatusPreferences));
  }

  loadColHeadersProjects(): void {
    this.columsHeaderFieldProjects = [
      { field: 'projectStatus', styles: {'width': 'auto'}, header: this.translate.instant(_('PROJECT_STATUS.PROJECT_STATUS')) },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

}
