import { Component } from '@angular/core';

@Component({
  selector: 'app-holidays-table',
  standalone: false,
  templateUrl: './holidays-table.component.html',
  styleUrls: ['./holidays-table.component.scss'],
})
export class HolidaysTableComponent {
  holidays = [
    { id: 1, sort: 1, name: 'Neujahr' },
    { id: 2, sort: 2, name: 'Heilige Drei Könige' },
    { id: 3, sort: 3, name: 'Rosenmontag' },
    { id: 4, sort: 4, name: 'Internationaler Frauentag' },
    { id: 5, sort: 5, name: 'Gründonnerstag' },
    { id: 6, sort: 6, name: 'Karfreitag' },
  ];

  originalHolidays = [...this.holidays];

  cols = [
    { field: 'sort', header: 'Sort' },
    { field: 'name', header: 'Feiertag' },
  ];

  selectedColumns = [...this.cols];

  applyFilter(event: Event, field: 'sort' | 'name') {
    const filterValue = (event.target as HTMLInputElement).value
      .trim()
      .toLowerCase();

    this.holidays = this.originalHolidays.filter((h) => {
      const value = h[field];
      return value.toString().toLowerCase().includes(filterValue);
    });
  }

  editHoliday(holiday: any) {
    console.log('Edit:', holiday);
  }

  deleteHoliday(id: number) {
    this.holidays = this.holidays.filter((h) => h.id !== id);
    this.originalHolidays = this.originalHolidays.filter((h) => h.id !== id);
  }

  createHoliday() {
    const newHoliday = {
      id: this.holidays.length + 1,
      sort: this.holidays.length + 1,
      name: 'Neuer Feiertag',
    };
    this.holidays.push(newHoliday);
    this.originalHolidays.push(newHoliday);
    console.log('Nuevo Feiertag', newHoliday);
  }
}
