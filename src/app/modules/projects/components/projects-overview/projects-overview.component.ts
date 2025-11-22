import { Component, computed, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Table } from 'primeng/table';

import { TranslateService, _, TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectUtils } from '../../../customer/sub-modules/projects/utils/project.utils';
import { Column } from '../../../../Entities/column';
import { UserPreference } from '../../../../Entities/user-preference';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { ProjectService } from '../../../../Services/project.service';
import { Project } from '../../../../Entities/project';

@Component({
  selector: 'app-projects-overview',
  standalone: false,
  providers: [MessageService, ConfirmationService, TranslatePipe, TranslateDirective],
  templateUrl: './projects-overview.component.html',
  styleUrl: './projects-overview.component.scss'
})
export class ProjectsOverviewComponent implements OnInit, OnDestroy {

  private readonly projectUtils = inject(ProjectUtils);
  private readonly projectService = inject(ProjectService);

  filterIndex = 5;

  public cols!: Column[];

  public selectedColumns!: Column[];

  public selectedFilterColumns!: Column[];

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

  public customer!: number;

  private projectLangSubscription!: Subscription;

  @ViewChild('dt2') dt2!: Table;

  userProjectPreferences: UserPreference = {};

  tableKey: string = 'Projects'

  dataKeys = ['projectLabel', 'projectName', 'fundingProgram', 'promoter', 'fundingLabel', 'startDate', 'endDate', 'authDate', 'fundingRate'];

  visibleProjectModal = false;

  isProjectLoading = false;

  selectedProject!: any;

  constructor(

    private readonly activatedRoute: ActivatedRoute,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly commonMessage: CommonMessagesService
  ) {
  }

  ngOnInit(): void {
    this.loadProjectColHeaders();
    this.selectedColumns = this.cols;
    this.userProjectPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.projectUtils.loadInitialData().subscribe();

    this.projectLangSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadProjectColHeaders();
      this.selectedColumns = this.cols;
      this.userProjectPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  openDeleteModal(id: any) {
    this.visibleProjectModal = true;
    const project = this.projects().find(project => project.id == id);
    if (project) {
      this.selectedProject = project;
    }
  }

  onProjectDelete() {
    if (this.selectedProject) {
      this.isProjectLoading = true;
      this.projectUtils.deleteProject(this.selectedProject.id).subscribe({
        next: () => {
          this.commonMessage.showDeleteSucessfullMessage();
        },
        error: (errorDelete) => {
          this.isProjectLoading = false;
          if (errorDelete.message.includes('have associated receivables')
            || errorDelete.message.includes('have associated orders')) {
            this.commonMessage.showErrorDeleteMessageContainsOtherEntities();
          } else {
            this.commonMessage.showErrorDeleteMessage();
          }
          this.visibleProjectModal = false;
          this.selectedProject = undefined;
        },
        complete: () => {
          this.visibleProjectModal = false;
          this.selectedProject = undefined;
          this.isProjectLoading = false;
        }
      })
    }
  }


  onUserProjectPreferencesChanges(userProjectPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectPreferences));
  }

  loadProjectColHeaders(): void {
    this.cols = [
      { 
        field: 'projectLabel',
        routerLink: (row: any) => `./project-details/${row.id}`, 
        header: this.translate.instant(_('PROJECTS.TABLE.PROJECT_LABEL')), 
        customClasses: ['fix-td-width-project-label'] 
      },
      {
        field: 'projectName',
        header: this.translate.instant(_('PROJECTS.TABLE.PROJECT_NAME')),
        customClasses: ['fix-td-width-project-name']
      },
      { field: 'fundingProgram', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_PROGRAM')), classesTHead: ['width-10'] },
      { field: 'promoter', header: this.translate.instant(_('PROJECTS.TABLE.PROMOTER')), classesTHead: ['width-10'] },
      { field: 'fundingLabel', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_LABEL')), customClasses: ['fix-td-width-project-funding-label'] },
      { field: 'startDate', type: 'date', header: this.translate.instant(_('PROJECTS.TABLE.START_DATE')), classesTHead: ['width-7']  },
      { field: 'endDate', type: 'date', header: this.translate.instant(_('PROJECTS.TABLE.END_DATE')), classesTHead: ['width-7']  },
      { field: 'authDate', type: 'date', header: this.translate.instant(_('PROJECTS.TABLE.AUTH_DATE')), classesTHead: ['width-10']  },
      { field: 'fundingRate', customClasses: ['align-right'], type: 'double', header: this.translate.instant(_('PROJECTS.TABLE.FUNDING_RATE')), classesTHead: ['width-10']  }
    ];
  }

  ngOnDestroy(): void {
    if (this.projectLangSubscription) {
      this.projectLangSubscription.unsubscribe();
    }
  }

  editProject(project: Project) {
    this.router.navigate(['./projects/project-details', project.id]);
  }

}
