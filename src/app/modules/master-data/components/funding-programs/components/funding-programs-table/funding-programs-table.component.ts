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

  private langSubscription!: Subscription;

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.fundingPrograms = [
      { id: 1, name: 'EFRE', sort: 1 },
      { id: 2, name: 'Eurostars', sort: 2 },
      { id: 3, name: 'Horizon 2020', sort: 3 },
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
      {
        field: 'name',
        minWidth: 150,
        header: this.translate.instant(_('FUNDING.TABLE.PROGRAM')),
      },
      {
        field: 'sort',
        minWidth: 60,
        header: this.translate.instant(_('FUNDING.TABLE.RATE')),
      },
    ];
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {});
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  editFundingProgram(program: any) {
    console.log('Editing', program);
  }

  deleteFundingProgram(id: number) {
    console.log('Deleting ID', id);
  }

  createFundingProgram() {
    console.log('Creating new funding program');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
