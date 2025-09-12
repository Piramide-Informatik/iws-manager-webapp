import { Component, OnInit, ViewChild, OnDestroy, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { _, TranslateService } from "@ngx-translate/core";
import { approvalStatus } from './approval-status.data'; 
import { UserPreferenceService } from '../../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../../Entities/user-preference';
import { ApprovalStatusUtils } from '../../../utils/approval-status-utils';
import { ApprovalStatusService } from '../../../../../../../Services/approval-status.service';
import { ApprovalStatus } from '../../../../../../../Entities/approvalStatus';
import { MessageService } from 'primeng/api';
import { ModalApprovalStatusComponent } from '../modal-approval-status/modal-approval-status.component';
import { ApprovalStatusStateService } from '../../../utils/approval-status-state.service';
@Component({
  selector: 'app-approval-types-table',
  standalone: false,
  templateUrl: './approval-status-table.component.html',
  styleUrl: './approval-status-table.component.scss',
})
export class ApprovalStatusTableComponent implements OnInit, OnDestroy {
  private readonly approvalStatusUtils = new ApprovalStatusUtils();
  private readonly approvalStatusService = inject(ApprovalStatusService);
  private readonly messageService = inject(MessageService);


  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedApprovalStatus: number | null = null;
  approvalStatusName: string = '';
  @ViewChild('approvalStatusModal') approvalStatusModalComponent!: ModalApprovalStatusComponent;
  
  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if(event.type === 'delete' && event.data) {
      this.selectedApprovalStatus = event.data;
      this.approvalStatusUtils.getApprovalStatusById(this.selectedApprovalStatus!).subscribe({
        next: (projectStatus) => {
          this.approvalStatusName = projectStatus?.status ?? '';
        },
        error: (error) => {
          console.error('Error fetching projectStatus:', error);
          this.approvalStatusName = '';
        }
      });
    }
    this.visibleModal = true;
  }

  approvalStatusesData: ApprovalStatus[] = [];
  
  appovalStatuses = [...approvalStatus];
  cols: any[] = [];
  selectedColumns: any[] = [];
  userApprovalTypePreferences: UserPreference = {};
  tableKey: string = 'ApprovalType'
  dataKeys = ['approvalStatus', 'order', 'projects', 'networks'];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;
  
  readonly approvalStatusesD = computed(()=>{
    return this.approvalStatusService.approvalStatuses().map(approvalStatus => ({
      id: approvalStatus.id,
      approvalStatus: approvalStatus.status,
      order: approvalStatus.sequenceNo,
      projects: approvalStatus.forProjects,
      networks: approvalStatus.forNetworks,
    }))
  });

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly approvalStatusStateService: ApprovalStatusStateService,
    ) { }

  ngOnInit() {
    this.loadApprovalStatuses();
    this.updateColumnHeaders();
    this.userApprovalTypePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns); 
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateColumnHeaders();
      this.userApprovalTypePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns); 
    });
  }

  loadApprovalStatuses(): void {
    this.approvalStatusService.getAllApprovalStatuses().subscribe({
          next: (data: ApprovalStatus[]) => {
            this.approvalStatusesData = data;
          },
          error: (error) => {
            console.error('Error loading project status data:', error);
            this.approvalStatusesData = [];
          }
        });
  }

  onUserApprovalTypePreferencesChanges(userApprovalTypePreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userApprovalTypePreferences));
  }
  
  private updateColumnHeaders(): void {
    this.loadColHeaders();
    this.selectedColumns = [...this.cols];
  }
  
  loadColHeaders(): void {
    this.cols = [
      { field: 'approvalStatus', minWidth: 110, header: this.translate.instant('APPROVAL_STATUS.TABLE.APPROVAL_STATUS') },
      { field: 'order', minWidth: 110, header: this.translate.instant('APPROVAL_STATUS.TABLE.ORDER') },
      { field: 'projects', minWidth: 110, header: this.translate.instant('APPROVAL_STATUS.TABLE.PROJECTS'), filter: { type: 'boolean' } },
      { field: 'networks', minWidth: 110, header: this.translate.instant('APPROVAL_STATUS.TABLE.NETWORKS'), filter: { type: 'boolean' } }
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
  onDialogShow() {
    if (this.modalType === 'create' && this.approvalStatusModalComponent) {
      this.approvalStatusModalComponent.focusInputIfNeeded();
    }
  }
  onVisibleModal(visible: boolean){
    this.visibleModal = visible;
  }

  onConfirmDelete(message: {severity: string, summary: string, detail: string}): void {
      this.messageService.add({
        severity: message.severity,
        summary: this.translate.instant(_(message.summary)),
        detail: this.translate.instant(_(message.detail)),
      });
    }
  
  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedApprovalStatus = null;
    }
  }

  editApprovalStatus(approvalStatus: ApprovalStatus){
    const approvalStatusToEdit: ApprovalStatus = {
          id: approvalStatus.id,
          status: approvalStatus.status,
          sequenceNo: approvalStatus.sequenceNo,
          forProjects: approvalStatus.forProjects? 1:0,
          forNetworks: 1,
          createdAt: approvalStatus.createdAt ?? '',
          updatedAt: approvalStatus.updatedAt ?? '',
          version: approvalStatus.version
        };
    
        this.approvalStatusUtils.getApprovalStatusById(approvalStatusToEdit.id).subscribe({
          next: (fullApprovalStatus) => {
            if (fullApprovalStatus) {
              this.approvalStatusStateService.setApprovalStatusToEdit(fullApprovalStatus);
            }
          },
          error: (err) => {
            console.error('Error loading approval status:', err);
          }
        });
  }
}