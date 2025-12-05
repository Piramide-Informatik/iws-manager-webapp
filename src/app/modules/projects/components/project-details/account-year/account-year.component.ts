import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { TranslateService, _, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Column } from '../../../../../Entities/column';
import { UserPreference } from '../../../../../Entities/user-preference';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { Project } from '../../../../../Entities/project';
import { ProjectPeriodUtils } from '../../../utils/project-period.util';

@Component({
  selector: 'app-projects-account-year',
  standalone: false,
  providers: [MessageService, ConfirmationService, TranslatePipe, TranslateDirective],
  templateUrl: './account-year.component.html',
  styleUrl: './account-year.component.scss'
})
export class ProjectsAccountYearOverviewComponent implements OnInit, OnDestroy {

  private readonly projectPeriodUtils = inject(ProjectPeriodUtils);
  private readonly commonMessageService = inject(CommonMessagesService);

  public cols!: Column[];
  public projectId!: string;
  public selectedProjectAccountYearTableColumns!: Column[];

  projectsAccountYears: any = []

  private projectAccountYearLangSubscription!: Subscription;

  userProjectAccountYearPreferences: UserPreference = {};

  projectAccountYearTableKey: string = 'ProjectsAccountYear'

  projectAccountYearDataKeys = ['year', 'beginning', 'end'];

  constructor(
    private readonly activatedRoute: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly commonMessage: CommonMessagesService,
    private readonly titleService: Title
  ) {
  }

  ngOnInit(): void {
    this.loadProjectColHeaders();
    this.selectedProjectAccountYearTableColumns = this.cols;
    this.userProjectAccountYearPreferences = this.userPreferenceService.getUserPreferences(this.projectAccountYearTableKey, this.selectedProjectAccountYearTableColumns);
    this.titleService.setTitle(
      `${this.translate.instant('PAGETITLE.PROJECT.PROJECTS')}`
    );

    this.projectAccountYearLangSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadProjectColHeaders();
      this.selectedProjectAccountYearTableColumns = this.cols;
      this.userProjectAccountYearPreferences = this.userPreferenceService.getUserPreferences(this.projectAccountYearTableKey, this.selectedProjectAccountYearTableColumns);
      this.titleService.setTitle(
        `${this.translate.instant('PAGETITLE.PROJECT.PROJECTS')}`
      );
    });

    this.activatedRoute.params.subscribe(params => {
      this.projectId = params['idProject'];
      this.projectPeriodUtils.getAllProjectPeriodByProject(this.projectId).subscribe(data => {
        this.projectsAccountYears = data.map( pay => {
          return {
            year: pay.periodNo,
            beginning: pay.startDate,
            end: pay.endDate
          }
        })
      })
    });
  }

  onUserProjectAccountYearPreferencesChanges(userProjectAccountYearPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectAccountYearPreferences));
  }

  loadProjectColHeaders(): void {
    this.cols = [
      { field: 'year', header: this.translate.instant(_('PROJECT_PERIOD.TABLE.YEAR')), classesTHead: ['width-35']},
      { field: 'beginning', type: 'date', header: this.translate.instant(_('PROJECT_PERIOD.TABLE.BEGINNING')), classesTHead: ['width-35']},
      { field: 'end', type: 'date', header: this.translate.instant(_('PROJECT_PERIOD.TABLE.END')), classesTHead: ['width-35'] },
    ];
  }

  ngOnDestroy(): void {
    if (this.projectAccountYearLangSubscription) {
      this.projectAccountYearLangSubscription.unsubscribe();
    }
  }

  editProject(project: Project) {
    this.router.navigate(['/projects/project-details', project.id]);
  }

  createProject(event: {created?: Project, error?: any}): void {
    if(event.created){
      this.commonMessageService.showCreatedSuccesfullMessage();
    }else if(event.error){
      this.commonMessageService.showErrorCreatedMessage();
    }
  }
}
