import { Component } from '@angular/core';
import { _, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MasterDataService } from '../../master-data.service';
import { RouterUtilsService } from '../../router-utils.service';

@Component({
  selector: 'app-project-status',
  standalone: false,
  templateUrl: './project-status.component.html',
  styles: ``
})
export class ProjectStatusComponent {

  public projects: any[] = [];
  public columsHeaderFieldProjects: any[] = [];
  
  private langSubscription!: Subscription;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService,
    private readonly routerUtils: RouterUtilsService
  ){}

  ngOnInit(): void {
    this.projects = this.masterDataService.getProjectStatusData();

    this.loadColHeadersProjects();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersProjects();
      this.routerUtils.reloadComponent(true);
    });
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
