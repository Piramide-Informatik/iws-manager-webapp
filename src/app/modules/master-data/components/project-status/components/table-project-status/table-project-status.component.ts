import { Component, ViewChild, inject, OnChanges, OnDestroy, OnInit, computed, SimpleChanges, effect } from '@angular/core';
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
  private projectStatusSvc = inject(projectStatusService);
  projectStatusess = this.projectStatusSvc.projectStatuses;

  private readonly projectStatusUtils = new ProjectStatusUtils();
  private readonly projectStatusService = inject(projectStatusService);
  private readonly messageService = inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedProjectStatus: number | null = null;
  projectStatusName: string = '';
  @ViewChild('projectStatusModel') projectStatusModelComponent!: ModelProjectStatusComponent;
  
  projectStatusModalComponent!: ModelProjectStatusComponent;
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
  
  readonly projectStatuses = computed(()=>{
    return this.projectStatusService.projectStatuses().map(projectStatus => ({
      id: projectStatus.id,
      projectStatus: projectStatus.name,
    }));
  });

  projects: any[] = [];
  projectColumns: any[] = [];
  projectStatusDisplayedColumns: any[] = [];
  isChipsVisible = false;
  userProjectStatusPreferences: UserPreference = {};
  tableKey: string = 'ProjectStatus'
  dataKeys = ['label','projectStatus'];
  projectStatusData: ProjectStatus[] = [];

  @ViewChild('dt2') dt2!:Table;

  private langSubscription!: Subscription;

  
  constructor(
        private readonly translate: TranslateService,
        private readonly masterDataService: MasterDataService,
        private readonly userPreferenceService: UserPreferenceService,
        private readonly routerUtils: RouterUtilsService
      ){
        effect(() => {
      console.log('Project statuses:', this.projectStatusess());
      console.log('projectColumns antes de filtrar:', this.projectColumns);
    });
  }
    
  ngOnInit(): void {
    this.loadProjectStatusData();
    this.loadProjectStatusHeadersAndColumns();
    this.userProjectStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.projectStatusDisplayedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadProjectStatusHeadersAndColumns();
      this.userProjectStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.projectStatusDisplayedColumns);
    })
    this.projects = this.masterDataService.getProjectStatusData();
    
    // this.loadColHeadersProjects();
    // this.userProjectStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProjects);
    // this.langSubscription = this.translate.onLangChange.subscribe(() => {
    //   this.loadColHeadersProjects();
    //   this.routerUtils.reloadComponent(true);
    //   this.userProjectStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columsHeaderFieldProjects);
    // });
  }
    
  onUserProjectStatusPreferencesChanges(userProjectStatusPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userProjectStatusPreferences));
  }
    
  
    
  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
  ngOnChanges(changes: SimpleChanges): void {
      if (changes['projectStatuses']) {
      this.prepareTableData();
    }
  }

  private prepareTableData () {
    if (this.projectStatuses().length > 0){
      this.projectStatusDisplayedColumns = [
        {field:'name', header: 'ProjectStatus'}
      ]
    }
  }
  
  loadProjectStatusHeadersAndColumns() {
    this.loadProjectStatusHeaders();
    this.projectStatusDisplayedColumns = this.projectColumns.filter(col => col != null);
  }
  
  loadProjectStatusHeaders(): void{
    this.projectColumns = [
      { field: 'label',
        minWidth: 110, 
        header: this.translate.instant(_('PROJECT_STATUS.PROJECT_STATUS')) 
      },
      {
        field: 'projectStatus',
        minWidth: 110,
        header: this.translate.instant(_('PROJECT_STATUS.PROJECT_STATUS'))
      }
    ];
  }

  onDialogShow() {
    if( this.modalType === 'create' && this.projectStatusModalComponent) {
      this.projectStatusModalComponent.focusInputIfNeeded();
    }
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if(!visible) {
      this.selectedProjectStatus = null;
    }
  }
  onDeleteConfirm(message: {severity: string, summary: string, detail: string}): void{
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    })
  }

  loadProjectStatusData(): void {
    this.projectStatusService.getAllProjectStatuses().subscribe({
      next: (data: ProjectStatus[]) => {
        this.projectStatusData = data;
      },
      error: (error) => {
        console.error('Error loading project status data:', error);
        this.projectStatusData = []; // Fallback to empty array
      }
    });
  }

  toastMessageDisplay(message: {severity: string, summary: string, detail: string}): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }
}
