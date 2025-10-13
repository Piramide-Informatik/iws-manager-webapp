import { Component, OnInit, ViewChild, OnDestroy, inject, computed } from '@angular/core';
import { Subscription } from 'rxjs';
import { TranslateService } from "@ngx-translate/core";
import { UserPreferenceService } from '../../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../../Entities/user-preference';
import { ApprovalStatusUtils } from '../../../utils/approval-status-utils';
import { ApprovalStatusService } from '../../../../../../../Services/approval-status.service';
import { ApprovalStatus } from '../../../../../../../Entities/approvalStatus';
import { ModalApprovalStatusComponent } from '../modal-approval-status/modal-approval-status.component';
import { ApprovalStatusStateService } from '../../../utils/approval-status-state.service';
import { Column } from '../../../../../../../Entities/column';
import { CommonMessagesService } from '../../../../../../../Services/common-messages.service';
@Component({
  selector: 'app-approval-types-table',
  standalone: false,
  templateUrl: './approval-status-table.component.html',
  styleUrl: './approval-status-table.component.scss',
})
export class ApprovalStatusTableComponent implements OnInit, OnDestroy {
  private readonly approvalStatusUtils = new ApprovalStatusUtils();
  private readonly approvalStatusService = inject(ApprovalStatusService);


  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedApprovalStatus: number | null = null;
  approvalStatusName: string = '';
  @ViewChild('approvalStatusModal') approvalStatusModalComponent!: ModalApprovalStatusComponent;
  
  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if(event.type === 'delete' && event.data) {
      this.selectedApprovalStatus = event.data;
      
      this.approvalStatusName = this.approvalStatuses().find(as => as.id === this.selectedApprovalStatus)?.status || '';
    }
    this.visibleModal = true;
  }
  
  cols: Column[] = [];
  selectedColumns: Column[] = [];
  userApprovalTypePreferences: UserPreference = {};
  tableKey: string = 'ApprovalType'
  dataKeys = ['status', 'sequenceNo', 'forProjects', 'forNetworks'];

  private langSubscription!: Subscription;
  
  readonly approvalStatuses = computed(()=>{
    return this.approvalStatusService.approvalStatuses();
  });

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly approvalStatusStateService: ApprovalStatusStateService,
    private readonly commonMessageService: CommonMessagesService
    ) { }

  ngOnInit() {
    this.approvalStatusUtils.loadInitialData().subscribe();
    this.updateColumnHeaders();
    this.userApprovalTypePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns); 
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateColumnHeaders();
      this.userApprovalTypePreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns); 
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
      { field: 'status', header: this.translate.instant('APPROVAL_STATUS.TABLE.APPROVAL_STATUS'), useSameAsEdit: true },
      { field: 'sequenceNo', header: this.translate.instant('APPROVAL_STATUS.TABLE.ORDER') },
      { field: 'forProjects', header: this.translate.instant('APPROVAL_STATUS.TABLE.PROJECTS'), filter: { type: 'boolean' } },
      { field: 'forNetworks', header: this.translate.instant('APPROVAL_STATUS.TABLE.NETWORKS'), filter: { type: 'boolean' } }
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
  
  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedApprovalStatus = null;
    }
  }

  editApprovalStatus(approvalStatus: ApprovalStatus){
    this.approvalStatusStateService.setApprovalStatusToEdit(approvalStatus);
  }

  toastMessageDisplay(message: { severity: string, summary: string, detail: string }): void {
    this.commonMessageService.showCustomSeverityAndMessage(
      message.severity,
      message.summary,
      message.detail
    )
  }

  onDeleteApprovalStatus() {
     this.approvalStatusStateService.clearApprovalStatus();
  }

  onModalApprovalStatusClose() {
    if (this.approvalStatusModalComponent) {
      this.approvalStatusModalComponent.onCancel();
    }
  }
}