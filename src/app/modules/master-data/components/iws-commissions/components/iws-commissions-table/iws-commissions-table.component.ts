import { Component, OnInit, OnDestroy, inject, computed, ViewChild} from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { RouterUtilsService } from '../../../../router-utils.service';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';

import { IwsCommissionService } from '../../../../../../Services/iws-commission.service';
import { IwsCommissionUtils } from '../../utils/iws-commision-utils';
import { IwsCommission } from '../../../../../../Entities/iws-commission ';
import { MessageService } from 'primeng/api';
import { Table } from 'primeng/table';
import { IwsCommissionStateService } from '../../utils/iws-commision-state.service';
import { Column } from '../../../../../../Entities/column';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-iws-commissions-table',
  standalone: false,
  templateUrl: './iws-commissions-table.component.html',
  styles: ``,
})
export class IwsCommissionsTableComponent implements OnInit, OnDestroy {
  private readonly iwsCommissionService = inject(IwsCommissionService);
  private readonly iwsCommissionUtils = new IwsCommissionUtils();
  private readonly messageService = inject(MessageService);
  visibleModal: boolean = false;
  modalType: 'create' | 'delete' = 'create';
  selectedIwsCommission: number | null = null;
  OrderValueIwsCommission: string = '';

  readonly commissions = computed(() => {
    return this.iwsCommissionService.iwsCommissions();
  });

  datascommissions: IwsCommission[] = [];
  columnsHeaderFieldCommissions: Column[] = [];
  userIwsCommissionsPreferences: UserPreference = {};
  tableKey: string = 'IwsCommissions'
  dataKeys = ['fromOrderValue', 'commission', 'minCommission'];

  @ViewChild('dt2') dt2!: Table;
  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly routerUtils: RouterUtilsService,
    private readonly commonMessageService: CommonMessagesService,
    private readonly iwsCommissionStateService: IwsCommissionStateService
  ) {}

  ngOnInit(): void {
    this.loadColHeadersCommissions();
    this.userIwsCommissionsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCommissions);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeadersCommissions();
      this.routerUtils.reloadComponent(true);
      this.userIwsCommissionsPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.columnsHeaderFieldCommissions);
    });

    this.iwsCommissionService.getAllIwsCommissions().subscribe({
    next: (data) => {
      this.datascommissions = data;
    },
    error: (err) => {
      this.datascommissions = [];
    }
  });
  }

  handleTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.modalType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedIwsCommission = event.data;

      this.OrderValueIwsCommission = this.commissions().find(c => c.id === this.selectedIwsCommission)?.fromOrderValue?.toString() ?? '';
    }
    this.visibleModal = true;
  }

  onUserIwsCommissionsPreferencesChanges(userIwsCommissionsPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsCommissionsPreferences));
  }

  loadColHeadersCommissions(): void {
    this.columnsHeaderFieldCommissions = [
      {
        field: 'fromOrderValue',
        classesTHead: ['width-33'],
        type: 'double',
        header: this.translate.instant(_('IWS_COMMISSIONS.TABLE.THRESHOLD')),
        customClasses: ['align-right'],
        useSameAsEdit: true 
      },
      {
        field: 'commission',
        classesTHead: ['width-33'],
        type: 'double',
        header: this.translate.instant(_('IWS_COMMISSIONS.TABLE.PERCENTAGE')),
        customClasses: ['align-right'] 
      },
      {
        field: 'minCommission',
        classesTHead: ['width-33'],
        type: 'double',
        header: this.translate.instant(_('IWS_COMMISSIONS.TABLE.MIN_COMMISSION')),
        customClasses: ['align-right'] 
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  onModalVisibilityChange(visible: boolean): void {
    this.visibleModal = visible;
    if (!visible) {
      this.selectedIwsCommission = null;
    }
  }

  toastMessageDisplay(message: {severity: string, summary: string, detail: string}): void {
    this.messageService.add({
      severity: message.severity,
      summary: this.translate.instant(_(message.summary)),
      detail: this.translate.instant(_(message.detail)),
    });
  }

  editIwsCommissions(iwsCommission: IwsCommission) {
    this.iwsCommissionStateService.setIwsCommissionToEdit(iwsCommission);
  }

  onIwsComissionDeleted(event?: {status: 'success' | 'error'}) {
    if (event?.status === 'success') {
      this.commonMessageService.showDeleteSucessfullMessage();
      this.iwsCommissionStateService.clearTitle();
    }else if(event?.status === 'error'){
      this.commonMessageService.showErrorDeleteMessage();
    }
  }

  onCreateIWSCommission(event: { status: 'success' | 'error'}) {
    if (event.status === 'success') {
      const sub = this.iwsCommissionService.loadInitialData().subscribe();
      this.langSubscription.add(sub);
      this.prepareTableData();
      this.commonMessageService.showCreatedSuccesfullMessage();
    }
    else{
      this.commonMessageService.showErrorCreatedMessage();
    }
  }

  private prepareTableData() {
    if (this.commissions().length > 0) {
      this.columnsHeaderFieldCommissions = [
        { field: 'fromOrderValue', header: 'From Order Value' },
        { field: 'commission', header: 'Commission' },
        { field: 'minCommission', header: 'Min Commission' }
      ];
    }
  }
}
