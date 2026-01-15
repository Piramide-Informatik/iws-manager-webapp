import { Component, ElementRef, OnInit, ViewChild, OnDestroy, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PublicHoliday } from '../../../../../../Entities/publicholiday';
import { State } from '../../../../../../Entities/state';
import { PublicHolidayStateService } from '../../utils/public-holiday-state.service';
import { PublicHolidayUtils } from '../../utils/public-holiday-utils';
import { BehaviorSubject, Subscription, take } from 'rxjs';
import {  momentCreateDate, momentFormatDate } from '../../../../../shared/utils/moment-date-utils';
import { PublicHolidayService } from '../../../../../../Services/public-holiday.service';
import { HolidayYearService } from '../../../../../../Services/holiday-year.service';
import { HolidayYear } from '../../../../../../Entities/holidayYear';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { DatePicker } from 'primeng/datepicker';
import { HolidayYearUtils } from '../../utils/holiday-year-utils';

@Component({
  selector: 'app-edit-holiday',
  standalone: false,
  templateUrl: './edit-holiday.component.html',
  styleUrls: ['./edit-holiday.component.scss'],
})
export class EditHolidayComponent implements OnInit, OnDestroy {
  years: HolidayYear[] = [];
  holidayYearToEdit!: HolidayYear | null;
  selectedPublicHolidayId!: number | undefined;
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  @ViewChild('datePicker') datePicker!: DatePicker;
  public showOCCErrorModalPublicHoliday = false;
  currentPublicHoliday: PublicHoliday | null = null;
  editPublicHolidayForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  private readonly holidayYearUtils = inject(HolidayYearUtils);
  private readonly editProjectStatusSource =
    new BehaviorSubject<PublicHoliday | null>(null);

  bundeslands: State[] = [];
  private statesModified = false;
  private yearsModified = false;
  public occErrorHolidayType: OccErrorType = 'UPDATE_UPDATED';

  isFixedDate: boolean = false;
  visibleModal: boolean = false;
  modalType: 'create' | 'edit' = 'create';
  holidayAlreadyExists = false;
  // Modal delete holiday year
  visibleDeleteModal = false;
  isLoadingDelete = false;

  constructor(
    private readonly publicHolidayUtils: PublicHolidayUtils,
    private readonly publicHolidayStateService: PublicHolidayStateService,
    private readonly commonMessageService: CommonMessagesService,
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
    this.holidayYearService.getAllHolidayYearsByPublicHolidayId(publicHolidayId).subscribe({
      next: (years) => {
        this.years = years;
      },
      error: (err) => {
        console.error('Error loading years:', err);
      },
    });
  }

  // Use for create holiday year with date fix
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

  onCreate(newHolidayYear: HolidayYear): void {
    this.years = [...this.years, newHolidayYear].sort((a, b) =>
      a.year.localeCompare(b.year)
    );
  }

  onEdit(edited: HolidayYear): void {
    this.years = this.years.map(y => y.id === edited.id ? edited : y).sort((a, b) =>
      a.year.localeCompare(b.year)
    );
  }

  onDelete(deleted: HolidayYear): void {
    this.years = this.years.filter(y => y.id !== deleted.id);
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
          this.statesModified = false;
        },
        error: (err) => console.error('Error saving states:', err),
      });
  }

  private initForm(): void {
    this.editPublicHolidayForm = new FormGroup({
      publicHoliday: new FormControl('', [Validators.required]),
      sequenceNo: new FormControl(null),
      isFixedDate: new FormControl(false),
      date: new FormControl('', [Validators.required]),
    });
    this.editPublicHolidayForm.get('isFixedDate')?.valueChanges.subscribe((isFixed: boolean) => {
      this.isFixedDate = isFixed;

      if (this.datePicker?.value) {
        const currentValue = this.datePicker.value;
        // Update format
        setTimeout(() => {
          this.datePicker.writeValue(currentValue);
          this.datePicker.updateInputfield();
        });
        return;
      }    
      this.editPublicHolidayForm.get('date')?.setValue(null);

      setTimeout(() => {
        this.datePicker.writeValue(null);
        this.datePicker.updateInputfield();
      });
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
      date: momentCreateDate(publicHoliday.date),
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
      date: momentFormatDate(this.editPublicHolidayForm.value.date),
      sequenceNo: this.editPublicHolidayForm.value.sequenceNo,
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
    for(const control of Object.values(this.editPublicHolidayForm.controls)) {
      control.markAsTouched();
      control.markAsDirty();
    }
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
    this.commonMessageService.showErrorEditMessage();
    if (err instanceof OccError) { 
      this.showOCCErrorModalPublicHoliday = true;
      this.occErrorHolidayType = err.errorType;
    } else if (err.message.includes('holiday already exists')) {
      this.holidayAlreadyExists = true;
      this.editPublicHolidayForm.get('publicHoliday')?.valueChanges.pipe(take(1))
        .subscribe(() => this.holidayAlreadyExists = false);
    }
  }

  clearForm(): void {
    this.editPublicHolidayForm.reset();
    setTimeout(() => {
      this.datePicker.writeValue(null);
      this.datePicker.updateInputfield();
    });
    this.currentPublicHoliday = null;
    this.isSaving = false;
    this.bundeslands = [];
    this.years = [];
    this.statesModified = false;
    this.yearsModified = false;
    this.selectedPublicHolidayId = undefined;
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

  onEditYear(holidayYear: HolidayYear): void {
    this.modalType = 'edit';
    this.holidayYearToEdit = {...holidayYear};
    this.visibleModal = true;
  }

  onNewYear(): void {
    this.modalType = 'create';
    this.visibleModal = true;
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

  public removeHolidayYear(): void {
    if(!this.holidayYearToEdit) return;

    this.isLoadingDelete = true;
    this.holidayYearUtils.deleteHolidayYear(this.holidayYearToEdit.id).subscribe({
      next: () => {
        this.isLoadingDelete = false;
        this.years = this.years.filter(y => y.id !== this.holidayYearToEdit!.id);
        this.commonMessageService.showDeleteSucessfullMessage();
        this.visibleDeleteModal = false;
        this.visibleModal = false;
        this.holidayYearToEdit = null;
      },
      error: (error) => {
        this.isLoadingDelete = false;
        console.log(error);
        this.commonMessageService.showErrorDeleteMessage();
      }
    });
  }
}