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
  absenceTypes: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService, private readonly router: Router) { }

  ngOnInit() {
    this.absenceTypes = [
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
      {
        id: 4,
        approvalStatus: 'Bewilligt',
        order: '4',
        projects: 'X',
        networks: '',
      },
      {
        id: 5,
        approvalStatus: 'Bewilligt',
        order: '8',
        projects: '',
        networks: '',
      },
      {
        id: 6,
        approvalStatus: 'Planung',
        order: '2',
        projects: 'X',
        networks: 'X',
      },
      {
        id: 7,
        approvalStatus: 'Planung',
        order: '7',
        projects: '',
        networks: 'X',
      },
      {
        id: 8,
        approvalStatus: 'Bewilligt',
        order: '4',
        projects: 'X',
        networks: 'X',
      },
      {
        id: 9,
        approvalStatus: 'Bewilligt',
        order: '1',
        projects: 'X',
        networks: 'X',
      },
      {
        id: 10,
        approvalStatus: 'Bewilligt',
        order: '2',
        projects: 'X',
        networks: 'X',
      },
    ];

    this.loadColHeaders();
    this.selectedColumns = [...this.cols];

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = [...this.cols];
    });
}

  loadColHeaders(): void {
    this.cols = [
      { field: 'approvalStatus', minWidth: 110, header: this.translate.instant(_('APPROVAL_STATUS.TABLE.APPROVAL_STATUS')) },
      { field: 'order', minWidth: 110, header: this.translate.instant(_('APPROVAL_STATUS.TABLE.ORDER')) },
      { field: 'projects', minWidth: 110, header: this.translate.instant(_('APPROVAL_STATUS.TABLE.PROJECTS')) },
      { field: 'networks', minWidth: 110, header: this.translate.instant(_('APPROVAL_STATUS.TABLE.NETWORKS')) }
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  editAbsenceType(absenceType: any) {
    console.log('Editing', absenceType);
  }

  deleteAbsenceType(id: number) {
    console.log('Deleting ID', id);
  }

  createAbsenceType() {
    console.log('Creating new absence type');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
