import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';

@Component({
  selector: 'app-funding-programs-table',
  standalone: false,
  templateUrl: './funding-programs-table.component.html',
  styleUrls: ['./funding-programs-table.component.scss'],
})
export class FundingProgramsTableComponent implements OnInit, OnDestroy {
  fundingPrograms: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService) {}

  ngOnInit() {
    this.fundingPrograms = [
      { id: 1, program: 'BMWi', rate: 25 },
      { id: 2, program: 'ZIM', rate: 45 },
      { id: 3, program: 'Eurostars', rate: 30 },
      { id: 4, program: 'Marketing', rate: 20 },
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
        field: 'program',
        minWidth: 110,
        header: this.translate.instant(_('FUNDING.TABLE.PROGRAM')),
      },
      {
        field: 'rate',
        minWidth: 110,
        header: this.translate.instant(_('FUNDING.TABLE.RATE')),
      },
    ];
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
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

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
