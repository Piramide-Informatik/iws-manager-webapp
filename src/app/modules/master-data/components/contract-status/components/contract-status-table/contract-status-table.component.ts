import { Component, ViewChild, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { CONTRACT_STATUS } from './contract-status.data';
import { UserPreferenceService } from '../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../Entities/user-preference';
import { ContractStatusUtils } from '../../utils/contract-status-utils';
import { ContractStatusService } from '../../../../../../Services/contract-status.service';


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

  @ViewChild('dt') dt!: Table;

  private langContractStatusSubscription!: Subscription;

  constructor(private readonly router: Router,
              private readonly userPreferenceService: UserPreferenceService, 
              private readonly translate: TranslateService ) { }

  ngOnInit() {
    this.contractStatusUtils.loadInitialData().subscribe();
    this.loadContractStatusHeadersAndColumns();
    this.userContractStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.contractStatusColumns);
    this.langContractStatusSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadContractStatusHeadersAndColumns();
      this.userContractStatusPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.contractStatusColumns);
    });
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
