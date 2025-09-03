import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  FormArray,
  FormControl,
  Validators,
} from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
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

@Component({
  selector: 'app-edit-holiday',
  standalone: false,
  templateUrl: './edit-holiday.component.html',
  styleUrls: ['./edit-holiday.component.scss'],
})
export class EditHolidayComponent implements OnInit {
  public showOCCErrorModalPublicHoliday = false;
  currentPublicHoliday: PublicHoliday | null = null;
  editPublicHolidayForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  private readonly editProjectStatusSource =
    new BehaviorSubject<PublicHoliday | null>(null);

  holidayForm!: FormGroup;
  bundeslands: State[] = [];

  years = [
    { year: 2025, date: new Date(2025, 0, 6) },
    { year: 2024, date: new Date(2024, 0, 6) },
    { year: 2023, date: new Date(2023, 0, 6) },
    { year: 2022, date: new Date(2022, 0, 6) },
    { year: 2021, date: new Date(2021, 0, 6) },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly publicHolidayUtils: PublicHolidayUtils,
    private readonly publicHolidayStateService: PublicHolidayStateService,
    private readonly messageService: MessageService,
    private readonly translate: TranslateService,
    private readonly publicHolidayService: PublicHolidayService
  ) {}

  ngOnInit(): void {
    this.initForm();
    this.setupPublicHolidaySubscription();
    const savedPublicHolidayId = localStorage.getItem(
      'selectedPublicHolidayId'
    );
    if (savedPublicHolidayId) {
      this.loadPublicHolidayAfterRefresh(savedPublicHolidayId);
      localStorage.removeItem('selectedPublicHolidayId');
    }
  }

  loadStates(publicHolidayId: number): void {
    this.publicHolidayService.getStatesByHolidayId(publicHolidayId).subscribe(states => {
      this.bundeslands = states;
    });
  }

  saveSelections(publicHolidayId: number): void {
    const selectedStateIds = this.bundeslands
      .filter((bl) => bl.selected) // we only use "selected"
      .map((bl) => bl.id); // we only send the ids
    console.log('Selected State IDs:', selectedStateIds);
    console.log('Id holiday', publicHolidayId);
    this.publicHolidayService
      .saveSelectedStates(publicHolidayId, selectedStateIds)
      .subscribe({
        next: () => console.log('States saved successfully'),
        error: (err) => console.error('Error saving states:', err),
      });
  }

  private initForm(): void {
    this.editPublicHolidayForm = new FormGroup({
      publicHoliday: new FormControl('', [Validators.required]),
      date: new FormControl('', [Validators.required]),
      sequenceNo: new FormControl('', [Validators.required]),
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
    console.log('Loaded PublicHoliday ID:', publicHoliday.id);
    this.loadStates(publicHoliday.id);
  }

  private loadPublicHolidayAfterRefresh(publicHolidayId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.publicHolidayUtils
        .getPublicHolidayById(Number(publicHolidayId))
        .subscribe({
          next: (publicHoliday) => {
            if (publicHoliday) {
              this.publicHolidayStateService.setPublicHolidayToEdit(
                publicHoliday
              );
            }
            this.isSaving = false;
          },
          error: () => {
            this.isSaving = false;
          },
        })
    );
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
      name: this.editPublicHolidayForm.value.publicHoliday,
      date: this.editPublicHolidayForm.value.date
        ? momentFormatDate(
            momentCreateDate(this.editPublicHolidayForm.value.date as string)
          )
        : '',
      sequenceNo: this.editPublicHolidayForm.value.sequenceNo,
      isFixedDate: this.editPublicHolidayForm.value.isFixedDate,
    };
    this.subscriptions.add(
      this.publicHolidayUtils
        .updatePublicHoliday(updatePublicHoliday)
        .subscribe({
          next: (savedPublicHoliday) => {
            console.log('Id holiday after save', savedPublicHoliday.id);
            this.saveSelections(savedPublicHoliday.id);
            this.handleSaveSuccess(savedPublicHoliday);
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

  private handleSaveSuccess(savedPublicHoliday: PublicHoliday): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS'),
    });
    this.publicHolidayStateService.setPublicHolidayToEdit(null);
    this.clearForm();
  }

  private handleError(err: any): void {
    if (
      err.message ===
      'Version conflict: PublicHoliday has been updated by another user'
    ) {
      this.showOCCErrorModalPublicHoliday = true;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    console.error('Error saving title:', error);
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('MESSAGE.ERROR'),
      detail: this.translate.instant('MESSAGE.UPDATE_FAILED'),
    });
    this.isSaving = false;
  }

  get bundeslandsArray(): FormArray {
    return this.holidayForm.get('bundeslands') as FormArray;
  }

  addYear(): void {
    const nextYear = this.getNextYear();
    const fixedDate = this.holidayForm.get('fixedDate')?.value;

    if (fixedDate) {
      const newDate = new Date(fixedDate);
      newDate.setFullYear(nextYear);

      this.years.push({
        year: nextYear,
        date: newDate,
      });
    }
  }

  private getNextYear(): number {
    if (this.years.length === 0) {
      return new Date().getFullYear();
    }
    const maxYear = Math.max(...this.years.map((y) => y.year));
    return maxYear + 1;
  }

  formatDate(date: Date): string {
    const day = ('0' + date.getDate()).slice(-2);
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear();
    return `${day}.${month}.${year}`;
  }
  getControl(index: number): FormControl {
    return this.bundeslandsArray.at(index) as FormControl;
  }

  clearForm(): void {
    this.editPublicHolidayForm.reset();
    this.currentPublicHoliday = null;
    this.isSaving = false;
    this.bundeslands = [];
  }

  onRefresh(): void {
    if (this.currentPublicHoliday?.id) {
      localStorage.setItem(
        'selectedPublicHolidayId',
        this.currentPublicHoliday.id.toString()
      );
      window.location.reload();
    }
  }
}
