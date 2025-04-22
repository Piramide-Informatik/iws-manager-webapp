import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from "@ngx-translate/core";
import { Router } from '@angular/router';


@Component({
  selector: 'app-approval-types-table',
  standalone: false,
  templateUrl: './approval-status-table.component.html',
  styleUrl: './approval-status-table.component.scss',
})
export class ApprovalStatusTableComponent implements OnInit, OnDestroy {
  appovalStatuses: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService, private readonly router: Router) { }

  ngOnInit() {
    this.appovalStatuses = [
      {
        id: 1,
        approvalStatus: 'Antrag',
        order: '1',
        projects: 'X',
        networks: 'X',
      },
      {
        id: 2,
        approvalStatus: 'Planung',
        order: '2',
        projects: 'X',
        networks: 'X',
      },
      {
        id: 3,
        approvalStatus: 'Planung',
        order: '3',
        projects: 'X',
        networks: 'X',
      },
    ];
  
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
    this.cols = [
      { field: 'approvalStatus', minWidth: 110, header: this.translate.instant(_('APPROVAL_STATUS.TABLE.APPROVAL_STATUS')) },
      { field: 'order', minWidth: 110, header: this.translate.instant(_('APPROVAL_STATUS.TABLE.ORDER')) },
      { field: 'projects', minWidth: 110, header: this.translate.instant(_('APPROVAL_STATUS.TABLE.PROJECTS')) },
      { field: 'networks', minWidth: 110, header: this.translate.instant(_('APPROVAL_STATUS.TABLE.NETWORKS')) }
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  editApprovalStatus(approvaStatus: any) {
    console.log('Editing', approvaStatus);
  }

  deleteApprovalStatus(id: number) {
    console.log('Deleting by ID approval status', id);
  }

  createApprovalStatus() {
    console.log('Creating new approval status');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}