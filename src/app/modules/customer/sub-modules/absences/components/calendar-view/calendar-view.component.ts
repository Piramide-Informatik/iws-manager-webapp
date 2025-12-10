import { Component, OnInit, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-calendar-view',
  standalone: false,
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent implements OnInit {

  private readonly translate = inject(TranslateService);

  // Days (1-31)
  days: number[] = [];
  months: string[] = [];

  // Matrix to store cell data
  calendarData: any[][] = [];

  // Current year to display in the title
  currentYear: number = new Date().getFullYear();

  // Array con los índices de meses pares (considerando 0-indexed)
  // Enero=0, Febrero=1, Marzo=2, Abril=3, Mayo=4, Junio=5, Julio=6, Agosto=7, Septiembre=8, Octubre=9, Noviembre=10, Diciembre=11
  // Necesitamos: Febrero (1), Abril (3), Junio (5), Agosto (7), Octubre (9), Diciembre (11)
  evenMonthsIndices: number[] = [1, 3, 5, 7, 9, 11]; // 0-based indexing

  constructor() { }

  ngOnInit(): void {
    this.initializeCalendar();
    this.loadTranslations();
    this.subscribeToLanguageChanges();
  }

  loadTranslations(): void {
    this.months = [
      this.translate.instant('CALENDAR.MONTH.JANUARY'),
      this.translate.instant('CALENDAR.MONTH.FEBRUARY'),
      this.translate.instant('CALENDAR.MONTH.MARCH'),
      this.translate.instant('CALENDAR.MONTH.APRIL'),
      this.translate.instant('CALENDAR.MONTH.MAY'),
      this.translate.instant('CALENDAR.MONTH.JUNE'),
      this.translate.instant('CALENDAR.MONTH.JULY'),
      this.translate.instant('CALENDAR.MONTH.AUGUST'),
      this.translate.instant('CALENDAR.MONTH.SEPTEMBER'),
      this.translate.instant('CALENDAR.MONTH.OCTOBER'),
      this.translate.instant('CALENDAR.MONTH.NOVEMBER'),
      this.translate.instant('CALENDAR.MONTH.DECEMBER')
    ];
  }

  // Subscribe to language changes
  subscribeToLanguageChanges(): void {
    this.translate.onLangChange.subscribe(() => {
      this.loadTranslations();
    });
  }

  initializeCalendar(): void {
    // Generate array of days (1-31)
    this.days = Array.from({ length: 31 }, (_, i) => i + 1);

    // Initialize 12x31 matrix with empty cells
    this.calendarData = [];
    for (let month = 0; month < 12; month++) {
      const monthRow = [];
      for (let day = 0; day < 31; day++) {
        monthRow.push({
          day: day + 1,
          month: month,
          value: '', // Empty cell by default
          hasData: false,
        });
      }
      this.calendarData.push(monthRow);
    }
  }

  // Method to add data to a specific cell
  setCellValue(monthIndex: number, dayIndex: number, value: any): void {
    if (this.calendarData[monthIndex]?.[dayIndex]) {
      this.calendarData[monthIndex][dayIndex].value = value;
      this.calendarData[monthIndex][dayIndex].hasData = true;
    }
  }

  // Method to check if a day is valid for a specific month
  isValidDay(monthIndex: number, dayIndex: number): boolean {
    const daysInMonth = this.getDaysInMonth(monthIndex);
    return dayIndex < daysInMonth;
  }

  // Check if a month is even (for styling)
  isEvenMonth(monthIndex: number): boolean {
    return this.evenMonthsIndices.includes(monthIndex);
  }

  // Get number of days in a month
  private getDaysInMonth(monthIndex: number): number {
    const year = this.currentYear;
    return new Date(year, monthIndex + 1, 0).getDate();
  }

  // Method to get the CSS class of a cell
  getCellClass(monthIndex: number, dayIndex: number): string {
    const baseClass = 'calendar-cell';
    const isValid = this.isValidDay(monthIndex, dayIndex);
    const isEvenMonth = this.isEvenMonth(monthIndex);

    let classes = baseClass;

    // Add class for even months (if the day is valid)
    if (isValid && isEvenMonth) {
      classes += ' even-month-cell';
    }

    if (!isValid) {
      classes += ' invalid-day';
    }

    const cell = this.calendarData[monthIndex][dayIndex];
    if (cell.hasData) {
      classes += ' has-data';
    }

    return classes;
  }

  // Method to handle cell click
  onCellClick(monthIndex: number, dayIndex: number): void {
    if (this.isValidDay(monthIndex, dayIndex)) {
      console.log(`Cell clicked: ${this.months[monthIndex]} - Day ${dayIndex + 1}`);

      const absenceText = this.translate.instant('CALENDAR.ABSENCE');
      const cell = this.calendarData[monthIndex][dayIndex];

      if (!cell.hasData) {
        this.setCellValue(monthIndex, dayIndex, absenceText);
      } else {
        this.calendarData[monthIndex][dayIndex].value = '';
        this.calendarData[monthIndex][dayIndex].hasData = false;
      }
    }
  }

  getCellTitle(monthIndex: number, dayIndex: number): string {
    // Check if indices are valid
    if (monthIndex < 0 || monthIndex >= this.months.length ||
      dayIndex < 0 || dayIndex >= this.days.length) {
      return this.translate.instant('CALENDAR.ERROR.INVALID_CELL');
    }

    // Check if the day is valid for this month
    if (!this.isValidDay(monthIndex, dayIndex)) {
      const daysInMonth = this.getDaysInMonth(monthIndex);
      return this.translate.instant('CALENDAR.ERROR.INVALID_DAY', {
        MONTH: this.months[monthIndex],
        DAYS: daysInMonth,
        DAY: dayIndex + 1
      });
    }

    // Get the corresponding cell
    const cell = this.calendarData[monthIndex]?.[dayIndex];

    // If the cell does not exist
    if (!cell) {
      return this.translate.instant('CALENDAR.CELL_INFO.EMPTY', {
        MONTH: this.months[monthIndex],
        DAY: dayIndex + 1
      });
    }

    // If the cell has data
    if (cell.hasData && cell.value) {
      return this.translate.instant('CALENDAR.CELL_INFO.WITH_DATA', {
        MONTH: this.months[monthIndex],
        DAY: dayIndex + 1,
        VALUE: cell.value
      });
    }

    // Empty cell by default
    return this.translate.instant('CALENDAR.CELL_INFO.EMPTY', {
      MONTH: this.months[monthIndex],
      DAY: dayIndex + 1
    });
  }

  getCalendarTitle(): string {
    return this.translate.instant('CALENDAR.TITLE', { YEAR: this.currentYear });
  }

  getInvalidDayIndicator(): string {
    return this.translate.instant('CALENDAR.INVALID_DAY_INDICATOR');
  }
}