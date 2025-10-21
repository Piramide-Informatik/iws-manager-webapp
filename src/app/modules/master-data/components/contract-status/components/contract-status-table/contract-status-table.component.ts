import { Component, ViewChild, OnInit, OnDestroy, inject, computed, Output, EventEmitter } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { ContractStatusUtils } from '../../utils/contract-status-utils';
import { ContractStatusService } from '../../../../../../Services/contract-status.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { ContractStatus } from '../../../../../../Entities/contractStatus';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-contract-status-table',
  standalone: false,
  templateUrl: './contract-status-table.component.html',
  styleUrl: './contract-status-table.component.scss'
})
export class ContractStatusTableComponent implements OnInit, OnDestroy {

  contractStatusUtils = new ContractStatusUtils();
  contractStatusService = inject(ContractStatusService);
  contractStatusValues = computed(() => {
    return this.contractStatusService.contractStatuses();
  });
  contractStatusColumns: any[] = [];
  userContractStatusPreferences: UserPreference = {};
  tableKey: string = 'ContractStatus';
  dataKeys = ['status'];
  visibleContractStatusModal: boolean = false;
  modalContractStatusType: 'create' | 'delete' = 'create';
  selectedContractStatus!: any;
  loadCreateDelete: boolean = false;
  
  public showOCCErrorModalDelete = false;
  public occErrorDeleteType: OccErrorType = 'DELETE_UNEXISTED';
  
  @Output() contractStatusToEdit = new EventEmitter<ContractStatus | null>();
  @Output() loadEdit = new EventEmitter<boolean>();
  @ViewChild('dt') dt!: Table;

  private langContractStatusSubscription!: Subscription;

  constructor(
    private readonly router: Router,
    private readonly userPreferenceService: UserPreferenceService, 
    private readonly translate: TranslateService,
    private readonly commonMessageService: CommonMessagesService
  ) { }

  ngOnInit() {
    this.contractStatusUtils.loadInitialData().subscribe();
    this.loadContractStatusHeadersAndColumns();
    this.userContractStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.contractStatusColumns);
    this.langContractStatusSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadContractStatusHeadersAndColumns();
      this.userContractStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.contractStatusColumns);
    });
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalContractStatusType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedContractStatus = this.contractStatusValues().find(cs => cs.id == event.data);
    }
    this.visibleContractStatusModal = true;
  }

  onModalVisibilityChange(isVisible: any) {
    this.visibleContractStatusModal = isVisible;
  }

  onContractStatusCreated(contractStatus: any) {
    this.loadCreateDelete = true;
    this.contractStatusUtils.addContractStatus(contractStatus).subscribe({
      next: () => {
        this.loadCreateDelete = false;
        this.commonMessageService.showCreatedSuccesfullMessage();
      },
      error: () => {
        this.loadCreateDelete = false;
        this.commonMessageService.showErrorCreatedMessage();
      }
    });
  }

  onContractStatusDeleted(contractStatus: any) {
  this.loadCreateDelete = true;
  if (!contractStatus?.id) return;

  this.contractStatusUtils.deleteContractStatus(contractStatus.id).subscribe({
    next: () => {
      this.loadCreateDelete = false;
      this.contractStatusToEdit.emit(null);
      this.commonMessageService.showDeleteSucessfullMessage();
      this.visibleContractStatusModal = false;
    },
    error: (error) => {
      this.loadCreateDelete = false;

      if (error instanceof OccError || error?.message.includes('404')) {
        this.showOCCErrorModalDelete = true;
        this.occErrorDeleteType = 'DELETE_UNEXISTED';
      }

      const errorMessage = error.error?.message ?? '';
      if (errorMessage.includes('foreign key constraint fails')) {
        this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(errorMessage);
        this.visibleContractStatusModal = false;
        return;
      }

      this.commonMessageService.showErrorDeleteMessage();
      this.visibleContractStatusModal = false;
    }
  });
}


  selectContractStatusToEdit(contractStatus: any) {
    this.contractStatusToEdit.emit(contractStatus);
  }

  editContractStatus(contractStatus: any) {
    this.loadEdit.emit(true);
    this.contractStatusUtils.updateContractStatus(contractStatus).subscribe({
      next: () => {
        this.loadEdit.emit(false);
        this.contractStatusToEdit.emit(null);
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: () => {
        this.loadEdit.emit(false);
        this.commonMessageService.showErrorEditMessage();
      }
    });
  }

  onUserContractStatusPreferencesChanges(userContractStatusPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userContractStatusPreferences));
  }

  loadContractStatusHeadersAndColumns() {
    this.contractStatusColumns = this.loadContractStatusHeaders();
  }

  loadContractStatusHeaders(): any[] {
    return [
      {
        field: 'status',
        minWidth: 110,
        header: this.translate.instant(_('CONTRACT_STATUS.TABLE_CONTRACT_STATUS.CONTRACT_STATUS')),
        useSameAsEdit: true
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.langContractStatusSubscription) {
      this.langContractStatusSubscription.unsubscribe();
    }
  }
}