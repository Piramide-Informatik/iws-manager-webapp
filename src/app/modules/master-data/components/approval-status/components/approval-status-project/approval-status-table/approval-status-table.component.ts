import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService } from "@ngx-translate/core";
import { approvalStatus } from './approval-status.data'; 
import { MasterDataService } from '../../../../../master-data.service';
import { UserPreferenceService } from '../../../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../../../Entities/user-preference';

@Component({
  selector: 'app-approval-types-table',
  standalone: false,
  templateUrl: './approval-status-table.component.html',
  styleUrl: './approval-status-table.component.scss',
})
export class ApprovalStatusTableComponent implements OnInit, OnDestroy {
  appovalStatuses = [...approvalStatus];
  cols: any[] = [];
  selectedColumns: any[] = [];
  userApprovalTypePreferences: UserPreference = {};
  tableKey: string = 'ApprovalType'
  dataKeys = ['approvalStatus', 'order', 'projects', 'networks'];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly masterDataService: MasterDataService
    ) { }

  ngOnInit() {
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
    this.cols = this.masterDataService.getApprovalStatusColumns();
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}