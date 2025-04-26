import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-funding-programs-table',
  standalone: false,
  templateUrl: './funding-programs-table.component.html',
  styleUrl: './funding-programs-table.component.scss',
})
export class FundingProgramsTableComponent implements OnInit, OnDestroy {
  fundingPrograms: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSub!: Subscription;

  constructor(
    private readonly translateService: TranslateService,
    private readonly routerService: Router
  ) {}

  ngOnInit(): void {
    this.fundingPrograms = [
      { id: 1, name: 'EFRE', sort: 1 },
      { id: 2, name: 'Eurostars', sort: 2 },
      { id: 3, name: 'Horizon 2020', sort: 3 },
    ];

    this.initializeColumns();
    this.selectedColumns = [...this.cols];

    this.langSub = this.translateService.onLangChange.subscribe(() => {
      this.initializeColumns();
      this.selectedColumns = [...this.cols];
    });
  }

  initializeColumns(): void {
    this.cols = [
      {
        field: 'name',
        minWidth: 150,
        header: this.translateService.instant(_('FUNDING.TABLE.PROGRAM')),
      },
      {
        field: 'sort',
        minWidth: 60,
        header: this.translateService.instant(_('FUNDING.TABLE.RATE')),
      },
    ];
  }

  reloadComponent(self: boolean, targetUrl?: string): void {
    const url = self ? this.routerService.url : targetUrl;
    this.routerService
      .navigateByUrl('/', { skipLocationChange: true })
      .then(() => {
        this.routerService.navigate([`/${url}`]).then(() => {});
      });
  }

  ngOnDestroy(): void {
    if (this.langSub) {
      this.langSub.unsubscribe();
    }
  }

  editFundingProgram(program: any): void {
    console.log('Edit action:', program);
  }

  deleteFundingProgram(id: number): void {
    console.log('Delete action - ID:', id);
  }

  createFundingProgram(): void {
    console.log('Create new funding program');
  }

  applyFilter(event: any, field: string): void {
    const value = (event.target as HTMLInputElement).value;
    if (value) {
      this.dt2.filter(value, field, 'contains');
    }
  }
}
