import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';

@Component({
  selector: 'app-holidays-table',
  standalone: false,
  templateUrl: './holidays-table.component.html',
  styleUrl: './holidays-table.component.scss',
})
export class HolidaysTableComponent implements OnInit, OnDestroy {
  holidays: any[] = [];
  cols: any[] = [];
  selectedColumns: any[] = [];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  constructor(private readonly translate: TranslateService) {}

  ngOnInit() {
    this.holidays = [
      { id: 1, sort: 1, name: 'Neujahr' },
      { id: 2, sort: 2, name: 'Heilige Drei Könige' },
      { id: 3, sort: 3, name: 'Rosenmontag' },
      { id: 4, sort: 4, name: 'Internationaler Frauentag' },
      { id: 5, sort: 5, name: 'Gründonnerstag' },
      { id: 6, sort: 6, name: 'Karfreitag' },
      { id: 7, sort: 7, name: 'Ostermontag' },
      { id: 8, sort: 8, name: 'Tag der Arbeit' },
      { id: 9, sort: 9, name: 'Pfingstmontag' },
      { id: 10, sort: 10, name: 'Mariä Himmelfahrt' },
      { id: 11, sort: 11, name: 'Allerheiligen' },
      { id: 12, sort: 12, name: '1. Weihnachtstag' },
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
        field: 'sort',
        header: this.translate.instant(_('HOLIDAYS.TABLE.SORT')),
      },
      {
        field: 'name',
        header: this.translate.instant(_('HOLIDAYS.TABLE.NAME')),
      },
    ];
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  editHoliday(holiday: any) {
    console.log('Editing Holiday:', holiday);
  }

  deleteHoliday(id: number) {
    console.log('Deleting Holiday ID:', id);
  }

  createHoliday() {
    console.log('Creating New Holiday');
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }
}
