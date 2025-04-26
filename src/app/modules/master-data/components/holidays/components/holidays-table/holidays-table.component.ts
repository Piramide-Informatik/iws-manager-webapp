import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { Table } from 'primeng/table';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Router } from '@angular/router';

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

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}

  ngOnInit() {
    this.holidays = [
      { id: 1, sort: 1, name: 'Neujahr' },
      { id: 2, sort: 2, name: 'Heilige Drei Könige' },
      { id: 3, sort: 3, name: 'Rosenmontag' },
      { id: 4, sort: 4, name: 'Internationaler Frauentag' },
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
        minWidth: 60,
        header: this.translate.instant(_('HOLIDAYS.TABLE.SORT')),
      },
      {
        field: 'name',
        minWidth: 150,
        header: this.translate.instant(_('HOLIDAYS.TABLE.NAME')),
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

  editHoliday(holiday: any) {
    console.log('Editing', holiday);
  }

  deleteHoliday(id: number) {
    console.log('Deleting ID', id);
  }

  createHoliday() {
    console.log('Creating new holiday');
  }

  applyFilter(event: any, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }
}
