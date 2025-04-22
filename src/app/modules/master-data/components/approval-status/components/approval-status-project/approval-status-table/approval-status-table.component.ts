import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService } from "@ngx-translate/core";
import { approvalStatus } from './approval-status.data'; 
import { MasterDataService } from '../../../../../master-data.service';

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

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly masterDataService: MasterDataService
    ) { }

  ngOnInit() {
    this.updateColumnHeaders();
  
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateColumnHeaders();
    });
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

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}