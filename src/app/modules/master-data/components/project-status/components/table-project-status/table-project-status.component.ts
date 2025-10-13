import { Component, ViewChild, inject, OnChanges, OnDestroy, OnInit, computed, SimpleChanges } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { _, TranslateService } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { ProjectStatusService } from '../../../../../../Services/project-status.service';
import { ProjectStatusUtils } from '../../../../../../modules/master-data/components/project-status/utils/project-status-utils';
import { ProjectStatus } from '../../../../../../Entities/projectStatus';
import { ProjectStatusStateService } from '../../utils/project-status-state.service';
import { Column } from '../../../../../../Entities/column';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { ModelProjectStatusComponent } from '../model-project-status/model-project-status.component';

@Component({
  selector: 'app-table-project-status',
  standalone: false,
  templateUrl: './table-project-status.component.html',
  styleUrl: './table-project-status.component.scss'
})
export class TableProjectStatusComponent implements OnInit, OnDestroy, OnChanges {
  private readonly translate = inject(TranslateService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly projectStatusStateService = inject(ProjectStatusStateService);
  private readonly projectStatusUtils = new ProjectStatusUtils();
  private readonly projectStatusService = inject(ProjectStatusService);
  private readonly commonMessageService = inject(CommonMessagesService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedProjectStatus: number | null = null;
  projectStatusName: string = '';
  @ViewChild('projectStatusModel') ModalProjectStatusComponent!: ModelProjectStatusComponent;

  readonly projectStatuses = computed(()=>{
    return this.projectStatusService.projectStatuses();
  });

  @ViewChild('projectStatusModel') dialog!: ModelProjectStatusComponent;

  projectColumns: Column[] = [];
  projectStatusDisplayedColumns: Column[] = [];
  isChipsVisible = false;
  userProjectStatusPreferences: UserPreference = {};
  tableKey: string = 'ProjectStatus'
  dataKeys = ['name'];
  projectStatusData: ProjectStatus[] = [];

  @ViewChild('dt2') dt2!:Table;

  private langSubscription!: Subscription;
    
  ngOnInit(): void {
    this.projectStatusUtils.loadInitialData().subscribe()
    this.loadProjectStatusHeadersAndColumns();
    this.userProjectStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.projectStatusDisplayedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadProjectStatusHeadersAndColumns();
      this.userProjectStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.projectStatusDisplayedColumns);
    })
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

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if(event.type === 'delete' && event.data) {
      this.selectedProjectStatus = event.data;
      this.projectStatusName = this.projectStatuses().find(ps => ps.id === this.selectedProjectStatus)?.name || '';
    }
    this.visibleModal = true;
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
    this.projectStatusDisplayedColumns = [...this.projectColumns];
  }
  
  loadProjectStatusHeaders(): void{
    this.projectColumns = [
      {
        field: 'name',
        header: this.translate.instant(_('PROJECT_STATUS.TABLE_PROJECT_STATUS.PROJECT_STATUS')),
        useSameAsEdit: true
      }
    ];
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if(!visible) {
      this.selectedProjectStatus = null;
    }
  }

  toastMessageDisplay(message: {severity: string, summary: string, detail: string}): void {
    this.commonMessageService.showCustomSeverityAndMessage(
      message.severity,
      message.summary,
      message.detail
    )
  }

  editProjectStatus(projectStatus: ProjectStatus){
    this.projectStatusStateService.setProjectStatusToEdit(projectStatus);
  }

  onDeleteProject() {
    this.projectStatusStateService.clearProjectStatus();
  }
  
  onModalProjectStatusClose() {
    if (this.dialog) {
      this.dialog.closeModel();
    }
  }
}
