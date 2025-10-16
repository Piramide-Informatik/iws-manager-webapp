import { Component, ElementRef, OnInit, ViewChild, OnDestroy } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { PublicHoliday } from '../../../../../../Entities/publicholiday';
import { State } from '../../../../../../Entities/state';
import { PublicHolidayStateService } from '../../utils/public-holiday-state.service';
import { PublicHolidayUtils } from '../../utils/public-holiday-utils';
import { BehaviorSubject, Subscription } from 'rxjs';
import {
  momentCreateDate,
  momentFormatDate,
} from '../../../../../shared/utils/moment-date-utils';
import moment from 'moment';
import { PublicHolidayService } from '../../../../../../Services/public-holiday.service';
import { HolidayYearService } from '../../../../../../Services/holiday-year.service';
import { HolidayYear } from '../../../../../../Entities/holidayYear';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-edit-holiday',
  standalone: false,
  templateUrl: './edit-holiday.component.html',
  styleUrls: ['./edit-holiday.component.scss'],
})
export class EditHolidayComponent implements OnInit, OnDestroy {
  years: HolidayYear[] = [];
  selectedPublicHolidayId!: number;
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public showOCCErrorModalPublicHoliday = false;
  currentPublicHoliday: PublicHoliday | null = null;
  editPublicHolidayForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  private readonly editProjectStatusSource =
    new BehaviorSubject<PublicHoliday | null>(null);

  holidayForm!: FormGroup;
  bundeslands: State[] = [];
  private statesModified = false;
  private yearsModified = false;
  public occErrorHolidayType: OccErrorType = 'UPDATE_UPDATED';

  constructor(
    private readonly fb: FormBuilder,
    private readonly publicHolidayUtils: PublicHolidayUtils,
    private readonly publicHolidayStateService: PublicHolidayStateService,
    private readonly commonMessageService: CommonMessagesService,
    private readonly translate: TranslateService,
    private readonly publicHolidayService: PublicHolidayService,
    private readonly holidayYearService: HolidayYearService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupPublicHolidaySubscription();
    this.loadPublicHolidayAfterRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  loadYears(publicHolidayId: number): void {
    this.holidayYearService.getByPublicHoliday(publicHolidayId).subscribe({
      next: (years) => {
        this.years = years;
      },
      error: (err) => {
        console.error('Error loading years:', err);
      },
    });
  }

  addYear(publicHolidayId: number | undefined): void {
    if (!publicHolidayId) return;

    this.holidayYearService.createNextYear(publicHolidayId).subscribe({
      next: (newYear) => {
        this.years = [...this.years, newYear].sort((a, b) =>
          a.year.localeCompare(b.year)
        );
        this.yearsModified = true;
      },
      error: (err) => {
        console.error('Error adding new year:', err);
        this.showOCCErrorModalPublicHoliday = true;
      },
    });
  }

  formatDate(date: string): string {
    console.log('Formatting date:', date);
    if (!date) return '';
    let day: string, month: string, year: string;

    if (date.includes('.')) {
      [day, month, year] = date.split('.');
    } else if (date.includes('-')) {
      [year, month, day] = date.split('-');
    } else {
      return date; 
    }
    day = day.padStart(2, '0');
    month = month.padStart(2, '0');

    return `${day}.${month}.${year}`;
  }

  loadStates(publicHolidayId: number): void {
    this.publicHolidayService
      .getStatesByHolidayId(publicHolidayId)
      .subscribe((states) => {
        this.bundeslands = states;
        this.statesModified = false;
        this.yearsModified = false;
      });
  }

  onStateSelectionChange(): void {
    this.statesModified = true;
  }

  saveSelections(publicHolidayId: number): void {
    const selectedStateIds = this.bundeslands
      .filter((bl) => bl.selected)
      .map((bl) => bl.id);
    this.publicHolidayService
      .saveSelectedStates(publicHolidayId, selectedStateIds)
      .subscribe({
        next: () => {
          console.log('States saved successfully'); 
          this.statesModified = false;
        },
        error: (err) => console.error('Error saving states:', err),
      });
  }

  private initForm(): void {
    this.editPublicHolidayForm = new FormGroup({
      publicHoliday: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      sequenceNo: new FormControl({value: null, disabled: true}),
      isFixedDate: new FormControl(true),
    });
  }

  private setupPublicHolidaySubscription(): void {
    this.subscriptions.add(
      this.publicHolidayStateService.currentPublicHoliday$.subscribe(
        (publicHoliday) => {
          this.currentPublicHoliday = publicHoliday;
          publicHoliday
            ? this.loadPublicHolidayData(publicHoliday)
            : this.clearForm();
        }
      )
    );
  }

  private loadPublicHolidayData(publicHoliday: PublicHoliday): void {
    this.editPublicHolidayForm.patchValue({
      publicHoliday: publicHoliday.name,
      date: publicHoliday.date
        ? moment(publicHoliday.date, 'YYYY-MM-DD').toDate()
        : null,
      sequenceNo: publicHoliday.sequenceNo,
      isFixedDate: publicHoliday.isFixedDate,
    });
    this.selectedPublicHolidayId = publicHoliday.id;
    this.loadStates(publicHoliday.id);
    this.loadYears(publicHoliday.id);
    this.focusInputIfNeeded();
  }

  private loadPublicHolidayAfterRefresh(): void {
    const savedPublicHolidayId = localStorage.getItem('selectedPublicHolidayId');
    if (savedPublicHolidayId) {
      this.isSaving = true;
      this.subscriptions.add(
        this.publicHolidayUtils
          .getPublicHolidayById(Number(savedPublicHolidayId))
          .subscribe({
            next: (publicHoliday) => {
              if (publicHoliday) {
                this.publicHolidayStateService.setPublicHolidayToEdit(publicHoliday);
              }
              this.isSaving = false;
              localStorage.removeItem('selectedPublicHolidayId');
            },
            error: () => {
              this.isSaving = false;
              localStorage.removeItem('selectedPublicHolidayId');
            },
          })
      );
    }
  }

  get hasChanges(): boolean {
    return this.editPublicHolidayForm.dirty || this.statesModified || this.yearsModified;
  }

  onSubmit(): void {
    if (
      this.editPublicHolidayForm.invalid ||
      !this.currentPublicHoliday ||
      this.isSaving
    ) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updatePublicHoliday: PublicHoliday = {
      ...this.currentPublicHoliday,
      name: this.editPublicHolidayForm.value.publicHoliday?.trim(),
      date: this.editPublicHolidayForm.value.date
        ? momentFormatDate(
            momentCreateDate(this.editPublicHolidayForm.value.date as string)
          )
        : '',
      sequenceNo: this.editPublicHolidayForm.getRawValue().sequenceNo,
      isFixedDate: this.editPublicHolidayForm.value.isFixedDate,
    };
    this.subscriptions.add(
      this.publicHolidayUtils
        .updatePublicHoliday(updatePublicHoliday)
        .subscribe({
          next: (savedPublicHoliday) => {
            this.saveSelections(savedPublicHoliday.id);
            this.handleSaveSuccess();
          },
          error: (err) => this.handleError(err),
        })
    );
  }

  private markAllAsTouched(): void {
    Object.values(this.editPublicHolidayForm.controls).forEach((control) => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleSaveSuccess(): void {
    this.isSaving = false;
    this.commonMessageService.showEditSucessfullMessage();
    this.statesModified = false; 
    this.yearsModified = false; 
    this.publicHolidayStateService.setPublicHolidayToEdit(null);
    this.clearForm();
  }

  private handleError(err: any): void {
    this.isSaving = false;
    if (err instanceof OccError) { 
      this.showOCCErrorModalPublicHoliday = true;
      this.occErrorHolidayType = err.errorType;
      this.commonMessageService.showErrorEditMessage();
    } else {
      this.commonMessageService.showErrorEditMessage();
    }
  }

  private handleSaveError(error: any): void {
    console.error('Error saving holiday:', error);
    this.isSaving = false;
  }

  get bundeslandsArray(): FormArray {
    return this.holidayForm.get('bundeslands') as FormArray;
  }

  getControl(index: number): FormControl {
    return this.bundeslandsArray.at(index) as FormControl;
  }

  clearForm(): void {
    this.editPublicHolidayForm.reset();
    this.currentPublicHoliday = null;
    this.isSaving = false;
    this.bundeslands = [];
    this.years = [];
    this.statesModified = false;
    this.yearsModified = false;
  }

  public onRefresh(): void {
    if (this.currentPublicHoliday?.id) {
      localStorage.setItem(
        'selectedPublicHolidayId',
        this.currentPublicHoliday.id.toString()
      );
      globalThis.location.reload();
    }
  }

  private focusInputIfNeeded() {
    if (this.currentPublicHoliday && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}