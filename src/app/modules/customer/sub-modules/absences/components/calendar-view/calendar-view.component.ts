import { Component, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild, computed, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { CustomPopoverComponent } from '../../../../../shared/components/custom-popover/custom-popover.component';
import { AbsenceTypeUtils } from '../../../../../master-data/components/absence-types/utils/absence-type-utils';
import { AbsenceTypeService } from '../../../../../../Services/absence-type.service';
import { DayOff } from '../../../../../../Entities/dayOff';
import { Employee } from '../../../../../../Entities/employee';
import { AbsenceType } from '../../../../../../Entities/absenceType';
import { AbsenceDayUtils } from '../../utils/absenceday-utils';
import { AbsenceDay } from '../../../../../../Entities/absenceDay';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { momentCreateDate } from '../../../../../shared/utils/moment-date-utils';
import { OccErrorType } from '../../../../../shared/utils/occ-error';
import { Subscription } from 'rxjs';
import { toSignal } from '@angular/core/rxjs-interop';

interface MonthRow {
  day: number,
  month: number,
  value: string,
  hasData: boolean,
  data: AbsenceDay | null
}

@Component({
  selector: 'app-calendar-view',
  standalone: false,
  templateUrl: './calendar-view.component.html',
  styleUrl: './calendar-view.component.scss'
})
export class CalendarViewComponent implements OnInit, OnChanges, OnDestroy {
  @ViewChild(CustomPopoverComponent) customPopover!: CustomPopoverComponent;
  private readonly translate = inject(TranslateService);
  private readonly absenceDayUtils = inject(AbsenceDayUtils);
  private readonly absenceTypeUtils = inject(AbsenceTypeUtils);
  private readonly absenceTypeService = inject(AbsenceTypeService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();

  public showOCCErrorModalCalendar = false;
  public errorType: OccErrorType = 'UPDATE_UPDATED';

  readonly absenceTypesSortedSignal = toSignal(
    this.absenceTypeService.getAllAbsenceTypesSortedByLabel(),
    { initialValue: [] }
  );

  readonly absenceTypesPopOverList = computed(() => {
    return this.absenceTypesSortedSignal().map(aType => ({
      id: aType.id,
      name: aType.name,
      label: aType.label,
      shareOfDay: aType.shareOfDay,
      hours: aType.hours
    }));
  });

  // Days (1-31)
  days: number[] = [];
  months: string[] = [];

  // Matrix to store cell data
  calendarData: MonthRow[][] = [];

  // Current year to display in the title
  @Input() currentYear!: number;

  // Map Weekends + holidays
  @Input() weekendsHolidaysMap!: Map<string, DayOff> | null;

  // Selected employee in dropdown
  @Input() employee!: Employee | undefined;

  // Output event when absence is changed
  @Output() absenceChanged = new EventEmitter<void>();

  // Employee Id after refresh occ
  @Output() employeeIdAfterRefresh = new EventEmitter<number>();

  isLoading = false;

  // Array with even month indices (0-indexed)
  // January=0, February=1, March=2, April=3, May=4, June=5, July=6, August=7, September=8, October=9, November=10, December=11
  // We need: February (1), April (3), June (5), August (7), October (9), December (11)
  evenMonthsIndices: number[] = [1, 3, 5, 7, 9, 11]; // 0-based indexing

  // Day and month selected for the popover
  selectedMonthIndex: number = -1;
  selectedDayIndex: number = -1;

  constructor() { }

  ngOnInit(): void {
    this.initializeCalendar();
    this.loadTranslations();
    this.loadEmployeeAfterRefresh();
    this.subscribeToLanguageChanges();
    this.absenceTypeUtils.loadInitialData().subscribe();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['employee'] && this.employee) || (changes['currentYear'] && this.employee)) {
      this.clearAllCells();
      this.absenceDayUtils.getAllAbsenceDaysByEmployeeIdByYear(this.employee.id, this.currentYear).subscribe(absenceDays => {
        if (absenceDays.length > 0) {
          const absenceDaysMapped = absenceDays.map(ad => ({
            ...ad,
            absenceDate: momentCreateDate(ad.absenceDate)
          }));

          for (let i in absenceDaysMapped) {
            if (absenceDaysMapped[i].absenceType && absenceDaysMapped[i].absenceDate) {
              this.setCellValue(absenceDaysMapped[i].absenceDate.getMonth(), absenceDaysMapped[i].absenceDate.getDate() - 1, absenceDaysMapped[i].absenceType.label, absenceDays[i]);
            }
          }
        }
      })
    } else if (changes['employee'] && !this.employee) {
      this.clearAllCells();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
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
    this.subscriptions.add(
      this.translate.onLangChange.subscribe(() => {
        this.loadTranslations();
      })
    );
  }

  initializeCalendar(): void {
    // Generate array of days (1-31)
    this.days = Array.from({ length: 31 }, (_, i) => i + 1);

    // Initialize 12x31 matrix with empty cells
    this.calendarData = [];
    for (let month = 0; month < 12; month++) {
      const monthRow: MonthRow[] = [];
      for (let day = 0; day < 31; day++) {
        monthRow.push({
          day: day + 1,
          month: month,
          value: '', // Empty cell by default
          hasData: false,
          data: null // CORRECCIÓN: Agregar esta propiedad para almacenar el item del popover -> AbsenceType
        });
      }
      this.calendarData.push(monthRow);
    }
  }

  // Method to add data to a specific cell
  setCellValue(monthIndex: number, dayIndex: number, value: string, data: AbsenceDay): void {
    if (monthIndex >= 0 && dayIndex >= 0 && this.calendarData[monthIndex]?.[dayIndex]) {
      this.calendarData[monthIndex][dayIndex].value = value;
      this.calendarData[monthIndex][dayIndex].hasData = true;
      this.calendarData[monthIndex][dayIndex].data = data;
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

    if (isWeekendOrHoliday) {
      classes += ' weekend-holiday';
    }

    if (!this.employee) {
      classes += ' no-employee-selected';
    }

    const cell = this.calendarData[monthIndex][dayIndex];
    if (cell.hasData) {
      classes += ' has-data';
    }

    return classes;
  }

  // Method to handle cell click
  onCellClick(monthIndex: number, dayIndex: number, event: MouseEvent): void {
    if (this.isValidDay(monthIndex, dayIndex) && !this.isWeekendOrHoliday(monthIndex, dayIndex) && this.employee) {

      // Save the selected cell
      this.selectedMonthIndex = monthIndex;
      this.selectedDayIndex = dayIndex;

      // Save the selected cell element
      const cellSelected = this.calendarData[this.selectedMonthIndex][this.selectedDayIndex];

      // Show the popover with data, hide options
      if (this.customPopover && cellSelected.data && cellSelected.hasData) {
        this.customPopover.values = [];
        this.customPopover.showButtonDelete = true;
        this.customPopover.toggle(event);
      } else if (this.customPopover && !cellSelected.data && !cellSelected.hasData) {
        this.customPopover.values = this.absenceTypesPopOverList();
        this.customPopover.showButtonDelete = false;
        this.customPopover.toggle(event);
      }
    }
  }

  // Method to handle keyboard events
  onCellKeyUp(event: KeyboardEvent, monthIndex: number, dayIndex: number): void {
    // Only trigger on Enter key for accessibility
    if (event.key === 'Enter' && this.isValidDay(monthIndex, dayIndex) && !this.isWeekendOrHoliday(monthIndex, dayIndex) && this.employee) {

      // Save the selected cell indices
      this.selectedMonthIndex = monthIndex;
      this.selectedDayIndex = dayIndex;

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
  onPopoverSelected(absenceTypeSelectedPopover: AbsenceType | null): void {
    if (this.selectedMonthIndex !== -1 && this.selectedDayIndex !== -1 && this.employee) {
      const cell = this.calendarData[this.selectedMonthIndex][this.selectedDayIndex];

      // Select item (absence type) in cell void
      if (absenceTypeSelectedPopover && !cell.data && !cell.hasData && cell.value === '') {
        // Create a absence day
        const monthNumeric = this.selectedMonthIndex + 1 < 10 ? `0${this.selectedMonthIndex + 1}` : this.selectedMonthIndex + 1;
        const dayNumeric = this.selectedDayIndex + 1 < 10 ? `0${this.selectedDayIndex + 1}` : this.selectedDayIndex + 1;
        const newAbsenceDay: Omit<AbsenceDay, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
          employee: this.employee,
          absenceType: absenceTypeSelectedPopover,
          absenceDate: `${this.currentYear}-${monthNumeric}-${dayNumeric}`
        };

        // Save the selected value
        this.absenceDayUtils.addAbsenceDay(newAbsenceDay).subscribe({
          next: (absenceDayCreated) => {
            this.commonMessageService.showCreatedSuccesfullMessage();
            cell.value = absenceTypeSelectedPopover.label;
            cell.hasData = true;
            cell.data = absenceDayCreated;
            this.absenceChanged.emit();
          },
          error: (err) => {
            if (err.error.message.includes('Absence already exists')) {
              this.showOCCErrorModalCalendar = true;
            }
            this.commonMessageService.showErrorCreatedMessage();
          }
        });

        // Selected clear in cell with data
      } else if (!absenceTypeSelectedPopover && cell.data && cell.hasData && cell.value) {
        // Delete absence day
        this.absenceDayUtils.deleteAbsenceDay(cell.data.id).subscribe({
          next: () => {
            this.commonMessageService.showDeleteSucessfullMessage();
            cell.value = '';
            cell.hasData = false;
            cell.data = null;
            this.absenceChanged.emit();
          },
          error: (err) => {
            if (err.error.message.includes('AbsenceDay not found')) {
              this.errorType = 'DELETE_UNEXISTED';
              this.showOCCErrorModalCalendar = true;
            }
            this.commonMessageService.showDeleteSucessfullMessage();
          }
        });
      }
    }

    // Reset selection
    this.resetSelection();
  }

  // Method to reset selection
  private resetSelection(): void {
    this.selectedMonthIndex = -1;
    this.selectedDayIndex = -1;
  }

  getCellTitle(monthIndex: number, dayIndex: number): string {
    // Check selected employee
    if (!this.employee) {
      return this.translate.instant('CALENDAR.ERROR.NO_EMPLOYEE_SELECTED');
    }

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

  clearAllCells(): void {
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      for (let dayIndex = 0; dayIndex < 31; dayIndex++) {
        if (this.isValidDay(monthIndex, dayIndex) && this.calendarData[monthIndex]?.[dayIndex]) {
          this.calendarData[monthIndex][dayIndex].value = '';
          this.calendarData[monthIndex][dayIndex].hasData = false;
          this.calendarData[monthIndex][dayIndex].data = null;
        }
      }
    }
  }

  // Method to get the current value of a cell
  getCellValue(monthIndex: number, dayIndex: number): any {
    if (this.calendarData[monthIndex]?.[dayIndex]) {
      return this.calendarData[monthIndex][dayIndex].value;
    }
    return '';
  }

  public onRefresh(): void {
    if (this.employee?.id) {
      localStorage.setItem('selectedEmployeeId', this.employee.id.toString());
      globalThis.location.reload();
    }
  }

  private loadEmployeeAfterRefresh(): void {
    const savedEmployeeId = localStorage.getItem('selectedEmployeeId');
    if (savedEmployeeId) {
      this.employeeIdAfterRefresh.emit(Number(savedEmployeeId));
    }
  }
}