import { Component, ViewChild, inject, OnChanges, OnDestroy, OnInit, computed, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { _, TranslateService } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { projectStatusService } from '../../../../../../Services/project-status.service';
import { ProjectStatusUtils } from '../../../../../../modules/master-data/components/project-status/utils/project-status-utils';
import { ProjectStatus } from '../../../../../../Entities/projectStatus';
import { ModelProjectStatusComponent  } from '../model-project-status/model-project-status.component';
import { MasterDataService } from '../../../../master-data.service';
import { RouterUtilsService } from '../../../../router-utils.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-table-project-status',
  standalone: false,
  templateUrl: './table-project-status.component.html',
  styleUrl: './table-project-status.component.scss'
})
export class TableProjectStatusComponent implements OnInit, OnDestroy, OnChanges {
  private readonly projectStatusUtils = new ProjectStatusUtils();
  private readonly projectStatusService = inject(projectStatusService);
  private readonly messageService = inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedProjectStatus: number | null = null;
  projectStatusName: string = '';
  @ViewChild('projectStatusModel') projectStatusModelComponent!: ModelProjectStatusComponent;
  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if(event.type === 'delete' && event.data) {
      this.selectedProjectStatus = event.data;
      this.projectStatusUtils.getProjectStatusById(this.selectedProjectStatus!).subscribe({
        next: (projectStatus) => {
          this.projectStatusName = projectStatus?.name ?? '';
        },
        error: (error) => {
          console.error('Error fetching projectStatus:', error);
          this.projectStatusName = '';
        }
      });
    }
    this.visibleModal = true;
  }

  readonly projetStatuses = computed(() => {
    return this.projectStatusService.projectStatus().map(projectStatus => ({
      id: projectStatus.id,
      name: projectStatus.name
    }));
  });
  
  projects: any[] = [];
  columsHeaderFieldProjects: any[] = [];
  projectStatusDisplayedColumns: any[] = [];
  isChipsVisible = false;
  userProjectStatusPreferences: UserPreference = {};
  tableKey: string = 'ProjectStatus'
  dataKeys = ['label','projectStatus'];

  @ViewChild('dt2') dt2!:Table;

  private langSubscription!: Subscription;

  constructor(
        private readonly translate: TranslateService,
        private readonly masterDataService: MasterDataService,
        private readonly userPreferenceService: UserPreferenceService,
        private readonly routerUtils: RouterUtilsService
      ){}
    
  ngOnInit(): void {
    this.projects = this.masterDataService.getProjectStatusData();
    
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
  ngOnChanges(changes: SimpleChanges): void {
      
  }
}
