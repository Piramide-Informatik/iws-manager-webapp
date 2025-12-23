import { Component, computed, inject, OnDestroy, OnInit, signal } from '@angular/core';
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
import { ProjectService } from '../../../../../Services/project.service';
import { ProjectUtils } from '../../../../customer/sub-modules/projects/utils/project.utils';
import { SelectChangeEvent } from 'primeng/select';

@Component({
  selector: 'app-projects-account-year',
  standalone: false,
  providers: [MessageService, ConfirmationService, TranslatePipe, TranslateDirective],
  templateUrl: './account-year.component.html',
  styleUrl: './account-year.component.scss'
})
export class ProjectsAccountYearOverviewComponent implements OnInit, OnDestroy {

  private readonly projectPeriodUtils = inject(ProjectPeriodUtils);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly projectService = inject(ProjectService);

  public cols!: Column[];
  public projectId!: string;
  public selectedProjectAccountYearTableColumns!: Column[];
  selectedProject = signal(0);
  modalProjectPeriodType: 'create' | 'delete' | 'edit' = 'create';
  visibleProjectPeriodModal: boolean = false;
  currentProjectPeriod!: any;
  projectsAccountYears: any = []

  private projectAccountYearLangSubscription!: Subscription;

  userProjectAccountYearPreferences: UserPreference = {};

  projectAccountYearTableKey: string = 'ProjectsAccountYear'

  projectAccountYearDataKeys = ['year', 'beginning', 'end'];
  readonly projects = computed(() => {
    return this.projectService.projects().map(curr => ({
      id: curr.id,
      projectLabel: curr.projectLabel,
      projectName: curr.projectName,
      fundingProgram: curr.fundingProgram?.name ?? '',
      promoter: curr.promoter?.projectPromoter ?? '',
      fundingLabel: curr.fundingLabel,
      startDate: curr.startDate,
      endDate: curr.endDate,
      authDate: curr.approvalDate,
      fundingRate: curr.fundingRate
    }));
  });

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
    this.projectUtils.loadInitialData().subscribe();
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
      this.loadProjectPeriod(this.projectId);
      this.selectedProject = signal(Number(this.projectId))
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

  onSelectedItem(event: SelectChangeEvent) {
    this.loadProjectPeriod(event.value);
  }

  loadProjectPeriod(id: string) {
    this.projectPeriodUtils.getAllProjectPeriodByProject(id).subscribe(data => {
      this.projectsAccountYears = data.map( pay => {
        return {
          id: pay.id,
          version: pay.version,
          year: pay.periodNo,
          beginning: pay.startDate,
          end: pay.endDate
        }
      })
    })
  }

  handleTableEvents(event: { type: 'create' | 'delete' | 'edit', data?: any }): void {
    this.modalProjectPeriodType = event.type;
    if (event.type === 'delete') {
      this.currentProjectPeriod = this.projectsAccountYears.find((c: any) => c.id === event.data);
      console.log(this.selectedProject)
    }
    this.visibleProjectPeriodModal = true;
  }

  onModalProjectPeriodModalVisibilityChange(visible: any): void {
    this.visibleProjectPeriodModal = visible; 
  }

  onDeleteProjectPeriod(projectPeriod: any) {
    this.projectsAccountYears = this.projectsAccountYears.filter((pa: any) => pa.id !== projectPeriod.id);
    this.currentProjectPeriod = undefined;
  }
}
