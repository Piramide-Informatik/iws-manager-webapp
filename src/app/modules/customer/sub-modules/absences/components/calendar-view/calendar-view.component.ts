import { Component, Input, OnInit, ViewChild, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CustomPopoverComponent } from '../../../../../shared/components/custom-popover/custom-popover.component';
import { AbsenceTypeUtils } from '../../../../../master-data/components/absence-types/utils/absence-type-utils';
import { AbsenceTypeService } from '../../../../../../Services/absence-type.service';
import { DayOff } from '../../../../../../Entities/dayOff';

@Component({
  selector: 'app-calendar-view',
  standalone: false,
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent implements OnInit {

  private readonly translate = inject(TranslateService);
  @ViewChild(CustomPopoverComponent) customPopover!: CustomPopoverComponent;


  private readonly absenceTypeUtils = inject(AbsenceTypeUtils);
  private readonly absenceTypeService = inject(AbsenceTypeService);
  readonly absenceTypesPopOverList = computed(() => {
    return this.absenceTypeService.absenceTypes().map(aType => ({
      id: aType.id,
      name: aType.name,
      label: aType.label,
      shareOfDay: aType.shareOfDay,
      isHoliday: aType.isHoliday && aType.isHoliday == 1,
      hours: aType.hours
    }));
  });

  // Days (1-31)
  days: number[] = [];
  months: string[] = [];

  // Matrix to store cell data
  calendarData: any[][] = [];

  // Current year to display in the title
  @Input() currentYear!: number;

  // Map Weekends + holidays
  @Input() weekendsHolidaysMap!: Map<string,DayOff> | null;

  // Array with even month indices (0-indexed)
  // January=0, February=1, March=2, April=3, May=4, June=5, July=6, August=7, September=8, October=9, November=10, December=11
  // We need: February (1), April (3), June (5), August (7), October (9), December (11)
  evenMonthsIndices: number[] = [1, 3, 5, 7, 9, 11]; // 0-based indexing

  // Day and month selected for the popover
  selectedMonthIndex: number = -1;
  selectedDayIndex: number = -1;

  // Reference to the currently selected cell (for the popover)
  private selectedCellElement: HTMLElement | null = null;

  constructor() { }

  ngOnInit(): void {
    this.initializeCalendar();
    this.loadTranslations();
    this.subscribeToLanguageChanges();
    this.absenceTypeUtils.loadInitialData().subscribe();
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
          data: null // CORRECCIÓN: Agregar esta propiedad para almacenar el item del popover
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

  isWeekendOrHoliday(monthIndex: number, dayIndex: number): boolean {
    const month = monthIndex + 1 < 10 ? `0${monthIndex + 1}` : `${monthIndex + 1}`;
    const day = dayIndex + 1 < 10 ? `0${dayIndex + 1}` : `${dayIndex + 1}`;
    return !!this.weekendsHolidaysMap?.get(`${this.currentYear}-${month}-${day}`);
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
    const isWeekendOrHoliday = this.isWeekendOrHoliday(monthIndex, dayIndex);

    let classes = baseClass;

    // Add class for even months (if the day is valid)
    if (isValid && isEvenMonth) {
      classes += ' even-month-cell';
    }

    if (!isValid) {
      classes += ' invalid-day';
    }

    if(isWeekendOrHoliday) {
      classes += ' weekend-holiday'; 
    }

    const cell = this.calendarData[monthIndex][dayIndex];
    if (cell.hasData) {
      classes += ' has-data';
    }

    return classes;
  }

  // Method to handle cell click
  onCellClick(monthIndex: number, dayIndex: number, event: MouseEvent): void {
    if (this.isValidDay(monthIndex, dayIndex) && !this.isWeekendOrHoliday(monthIndex, dayIndex)) {
      console.log(`Cell clicked: ${this.months[monthIndex]} - Day ${dayIndex + 1}`);

      // Save the selected cell
      this.selectedMonthIndex = monthIndex;
      this.selectedDayIndex = dayIndex;

      // Save the selected cell element
      this.selectedCellElement = event.currentTarget as HTMLElement;

      // Show the popover
      if (this.customPopover) {
        this.customPopover.toggle(event);
      }
    }
  }

  // Method to handle keyboard events
  onCellKeyUp(event: KeyboardEvent, monthIndex: number, dayIndex: number): void {
    // Only trigger on Enter key for accessibility
    if (event.key === 'Enter' && this.isValidDay(monthIndex, dayIndex)) {
      console.log(`Cell activated via keyboard: ${this.months[monthIndex]} - Day ${dayIndex + 1}`);

      // Save the selected cell indices
      this.selectedMonthIndex = monthIndex;
      this.selectedDayIndex = dayIndex;

      // Save the selected cell element
      this.selectedCellElement = event.currentTarget as HTMLElement;

      // Create a synthetic click event for the popover
      const syntheticEvent = new MouseEvent('click', {
        view: window,
        bubbles: true,
        cancelable: true,
        clientX: 0,
        clientY: 0
      });

      Object.defineProperty(syntheticEvent, 'target', { value: event.currentTarget });
      Object.defineProperty(syntheticEvent, 'currentTarget', { value: event.currentTarget });

      // Show the popover
      if (this.customPopover) {
        setTimeout(() => {
          this.customPopover.toggle(syntheticEvent);
        }, 0);
      }
    }
  }

  // Method to handle popover selection
  onPopoverSelected(item: any): void {
    console.log(`Item selected from popover:`, item);

    if (this.selectedMonthIndex !== -1 && this.selectedDayIndex !== -1) {
      const cell = this.calendarData[this.selectedMonthIndex][this.selectedDayIndex];

      if (item) {
        // Save the selected value
        cell.value = item.label || item.value || item;
        cell.hasData = true;
        cell.data = item;

        // Translation for the tooltip
        const translatedValue = this.translate.instant(`CALENDAR.OPTIONS.${item.value || item}`);

        // Update with translated value if exists
        if (translatedValue !== `CALENDAR.OPTIONS.${item.value || item}`) {
          cell.value = translatedValue;
        }
      } else {
        // If null/undefined is selected, clear the cell
        cell.value = '';
        cell.hasData = false;
        cell.data = null;
      }

      console.log(`Updated cell ${this.months[this.selectedMonthIndex]} - Day ${this.selectedDayIndex + 1}:`, cell.value);
    }

    // Reset selection
    this.resetSelection();
  }

  // Method to reset selection
  private resetSelection(): void {
    this.selectedMonthIndex = -1;
    this.selectedDayIndex = -1;
    this.selectedCellElement = null;
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

  // Method to clear a specific cell
  clearCell(monthIndex: number, dayIndex: number): void {
    if (this.isValidDay(monthIndex, dayIndex) && this.calendarData[monthIndex]?.[dayIndex]) {
      this.calendarData[monthIndex][dayIndex].value = '';
      this.calendarData[monthIndex][dayIndex].hasData = false;
      this.calendarData[monthIndex][dayIndex].data = null;
    }
  }

  // Method to get the current value of a cell
  getCellValue(monthIndex: number, dayIndex: number): any {
    if (this.calendarData[monthIndex]?.[dayIndex]) {
      return this.calendarData[monthIndex][dayIndex].value;
    }
    return '';
  }
}