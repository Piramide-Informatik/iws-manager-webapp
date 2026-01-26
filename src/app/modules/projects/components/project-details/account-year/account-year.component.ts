import { Component, computed, inject, OnDestroy, OnInit, Signal, signal } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { TranslateService, _, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { of, Subscription, switchMap, take, tap } from 'rxjs';
import { ActivatedRoute } from '@angular/router';
import { Column } from '../../../../../Entities/column';
import { UserPreference } from '../../../../../Entities/user-preference';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { Project } from '../../../../../Entities/project';
import { ProjectPeriodUtils } from '../../../utils/project-period.util';
import { ProjectService } from '../../../../../Services/project.service';
import { ProjectUtils } from '../../../../customer/sub-modules/projects/utils/project.utils';
import { SelectChangeEvent } from 'primeng/select';
import { ProjectStateService } from '../../../utils/project-state.service';
import { ProjectPeriod } from '../../../../../Entities/project-period';
import { OccError, OccErrorType } from '../../../../shared/utils/occ-error';

@Component({
  selector: 'app-projects-account-year',
  standalone: false,
  providers: [MessageService, ConfirmationService, TranslatePipe, TranslateDirective],
  templateUrl: './account-year.component.html',
  styleUrl: './account-year.component.scss'
})
export class ProjectsAccountYearOverviewComponent implements OnInit, OnDestroy {
  private readonly projectStateService = inject(ProjectStateService);
  private readonly projectPeriodUtils = inject(ProjectPeriodUtils);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly projectService = inject(ProjectService);
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly projectId: number = Number(this.activatedRoute.snapshot.params['idProject']);
  private readonly titleService = inject(Title);

  public cols!: Column[];
  selectedProject = signal(0);
  public currentProject!: Project | null;
  public selectedProjectAccountYearTableColumns!: Column[];
  modalProjectPeriodType: 'create' | 'delete' | 'edit' = 'create';
  visibleProjectPeriodModal: boolean = false;
  currentProjectPeriod!: ProjectPeriod | undefined;
  projectsAccountYears: any = []
  public showOCCErrorModalProjectPeriod = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  private projectAccountYearLangSubscription!: Subscription;
  userProjectAccountYearPreferences: UserPreference = {};
  projectAccountYearTableKey: string = 'ProjectsAccountYear'

  projectAccountYearDataKeys = ['periodNo', 'startDate', 'endDate'];
  readonly projects: Signal<Project[]> = computed(() => {
    return this.projectService.projects();
  });

  ngOnInit(): void {
    this.projectUtils.loadInitialData().subscribe();
    this.getCurrentProject();
    this.loadProjectColHeaders();
    this.selectedProjectAccountYearTableColumns = this.cols;
    this.userProjectAccountYearPreferences = this.userPreferenceService.getUserPreferences(this.projectAccountYearTableKey, this.selectedProjectAccountYearTableColumns);
    this.titleService.setTitle(
      `${this.translate.instant('PAGETITLE.PROJECT.ACCOUNTING_YEARS')}`
    );

    this.projectAccountYearLangSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadProjectColHeaders();
      this.selectedProjectAccountYearTableColumns = this.cols;
      this.userProjectAccountYearPreferences = this.userPreferenceService.getUserPreferences(this.projectAccountYearTableKey, this.selectedProjectAccountYearTableColumns);
      this.titleService.setTitle(
        `${this.translate.instant('PAGETITLE.PROJECT.ACCOUNTING_YEARS')}`
      );
    });

    this.loadProjectPeriod(this.projectId);
    this.selectedProject = signal(this.projectId);

  }

  onUserProjectAccountYearPreferencesChanges(userProjectAccountYearPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectAccountYearPreferences));
  }

  loadProjectColHeaders(): void {
    this.cols = [
      {
        field: 'periodNo',
        customClasses: ['align-right'],
        header: this.translate.instant(_('PROJECT_PERIOD.TABLE.YEAR')),
        classesTHead: ['width-18']
      },
      { field: 'startDate', type: 'date', header: this.translate.instant(_('PROJECT_PERIOD.TABLE.BEGINNING')), classesTHead: ['width-35'] },
      { field: 'endDate', type: 'date', header: this.translate.instant(_('PROJECT_PERIOD.TABLE.END')), classesTHead: ['width-35'] },
    ];
  }

  ngOnDestroy(): void {
    if (this.projectAccountYearLangSubscription) {
      this.projectAccountYearLangSubscription.unsubscribe();
    }
  }

  onSelectedItem(event: SelectChangeEvent) {
    this.loadProjectPeriod(event.value);
    this.projectUtils.getProjectById(event.value).subscribe(selectedProject => {
      if (selectedProject) {
        this.currentProject = selectedProject;
      }
    })
  }

  loadProjectPeriod(id: number) {
    this.projectPeriodUtils.getAllProjectPeriodByProject(id).subscribe(data => {
      this.projectsAccountYears = data;
    })
  }

  handleTableEvents(event: { type: 'create' | 'delete' | 'edit', data?: any }): void {
    this.modalProjectPeriodType = event.type;

    if (this.modalProjectPeriodType === 'edit' && event.data) {
      this.currentProjectPeriod = event.data;
    }
    if (event.type === 'delete') {
      this.currentProjectPeriod = this.projectsAccountYears.find((c: any) => c.id === event.data);
    }
    this.visibleProjectPeriodModal = true;
  }

  onModalProjectPeriodModalVisibilityChange(visible: any): void {
    this.visibleProjectPeriodModal = visible;
  }

  onDeleteProjectPeriod(event: { projectPeriod?: ProjectPeriod, error?: any }): void {
    if(event.projectPeriod){
      this.projectsAccountYears = this.projectsAccountYears.filter((pa: any) => pa.id !== event.projectPeriod?.id);
      this.currentProjectPeriod = undefined;
    }else if(event.error){
      if (event.error instanceof OccError || event.error?.message?.includes('404') || event.error?.errorType === 'DELETE_UNEXISTED') {
        this.showOCCErrorModalProjectPeriod = true;
        this.occErrorType = 'DELETE_UNEXISTED';
      }
    }
  }

  createUpdateProjectPeriod(event: { status: 'success' | 'error', error?: any }): void {
    if (event.status === 'success') {
      this.loadProjectPeriod(this.projectId);
    }else if(event.status === 'error' && event.error){
      if(event.error instanceof OccError){
        this.occErrorType = event.error.errorType;
        this.showOCCErrorModalProjectPeriod = true;
      }
    }
  }

  private getCurrentProject(): void {
    if (!this.projectId || Number.isNaN(this.projectId)) return;

    this.projectStateService.currentProject$.pipe(
      take(1),
      switchMap(projectFromState => {
        if (projectFromState && projectFromState.id === this.projectId) {
          return of(projectFromState);
        }
        return this.projectUtils.getProjectById(this.projectId);
      }),
      tap(project => {
        if (project) {
          this.currentProject = project;
          this.projectStateService.setProjectToEdit(project);
        }
      })
    ).subscribe({
      error: (error) => console.error('Error:', error)
    });
  }
}
