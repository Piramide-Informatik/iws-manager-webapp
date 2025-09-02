import { Component, ViewChild, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { ContractStatusUtils } from '../../utils/contract-status-utils';
import { ContractStatusService } from '../../../../../../Services/contract-status.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';


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
  tableKey: string = 'ContractStatus'
  dataKeys = ['contractStatus'];
  visibleContractStatusModal: boolean = false;
  modalContractStatusType: 'create' | 'delete' = 'create';
  selectedContractStatus!: any;

  @ViewChild('dt') dt!: Table;

  private langContractStatusSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService, 
              private readonly translate: TranslateService,
              private readonly commonMessageService: CommonMessagesService ) { }

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
    this.contractStatusUtils.addContractStatus(contractStatus).subscribe({
      next: () => this.commonMessageService.showCreatedSuccesfullMessage(),
      error: (err) => {
        console.log(err);
        this.commonMessageService.showErrorCreatedMessage();
      }
    })
  }

  onContractStatusDeleted(contractStatus: any) {
    console.log(contractStatus)
  }

  editTitle(contractStatus: any) {
    console.log(contractStatus);
  }

  onUserContractStatusPreferencesChanges(userContractStatusPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userContractStatusPreferences));
  }

  loadContractStatusHeadersAndColumns() {
    this.contractStatusColumns = this.loadContractStatusHeaders();;
  }

  loadContractStatusHeaders(): any[] {
    return [
      {
        field: 'status',
        minWidth: 110,
        header: this.translate.instant(_('CONTRACT_STATUS.TABLE_CONTRACT_STATUS.CONTRACT_STATUS'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langContractStatusSubscription) {
      this.langContractStatusSubscription.unsubscribe();
    }
  }
}
