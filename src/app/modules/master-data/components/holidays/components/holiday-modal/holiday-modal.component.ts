import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { PublicHolidayUtils } from '../../utils/public-holiday-utils';
import { finalize, map, switchMap, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { momentFormatDate } from '../../../../../shared/utils/moment-date-utils';
import { PublicHolidayStateService } from '../../utils/public-holiday-state.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { DatePicker } from 'primeng/datepicker';
import { PublicHoliday } from '../../../../../../Entities/publicholiday';
import { HolidayYearUtils } from '../../utils/holiday-year-utils';
@Component({
  selector: 'app-holiday-modal',
  standalone: false,
  templateUrl: './holiday-modal.component.html',
  styleUrl: './holiday-modal.component.scss',
})
export class HolidayModalComponent implements OnInit, OnDestroy, OnChanges {
  private readonly publicHolidayUtils = inject(PublicHolidayUtils);
  private readonly holidayYearUtils = inject(HolidayYearUtils);
  private readonly publicHolidayStateService = inject(PublicHolidayStateService);
  private readonly commonMessageService = inject(CommonMessagesService); 
  private readonly subscriptions = new Subscription();
  @ViewChild('publicHolidayInput') publicHolidayInput!: ElementRef<HTMLInputElement>;
  @ViewChild('datePicker') datePicker!: DatePicker;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visible: boolean = false;
  @Input() publicHolidayToDelete: number | null = null;
  @Input() publicHolidayName: string | null = null;
  @Output() isVisibleModel = new EventEmitter<boolean>();
  @Output() publicHolidayCreated = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{
    severity: string;
    summary: string;
    detail: string;
  }>();

  isLoading = false;
  errorMessage: string | null = null;
  showOCCErrorModalHoliday = false;
  public occErrorHolidayType: OccErrorType = 'DELETE_UNEXISTED';
  fixDateFormatPicker: string = 'dd.mm.';
  dateFormatPicker: string = 'dd.mm.yy';
  isFixedDate: boolean = false;
  holidayAlreadyExists = false;

  readonly createdPublicHolidayForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    sequenceNo: new FormControl(null),
    isFixedDate: new FormControl(false),
    date: new FormControl(null, [Validators.required]),
  });

  constructor() {} 

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
    this.createdPublicHolidayForm.get('isFixedDate')?.valueChanges.subscribe(value => {
      this.isFixedDate = value ?? false;
      if (this.datePicker) {
        const currentValue = this.datePicker.value;

        setTimeout(() => {
          this.datePicker.writeValue(currentValue);
          this.datePicker.updateInputfield();
        });
      }
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      });
    }else if(changes['visible'] && !this.visible){
      this.resetForm();
      setTimeout(() => {
        this.datePicker.writeValue(null);
        this.datePicker.updateInputfield();
      });
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private loadInitialData() {
    const sub = this.publicHolidayUtils.loadInitialData().subscribe();
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onDeleteConfirm(): void {
    this.isLoading = true;
    if (this.publicHolidayToDelete) {
      const sub = this.publicHolidayUtils
        .deletePublicHoliday(this.publicHolidayToDelete)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: () => {
            this.isLoading = false;
            this.toastMessage.emit({
              severity: 'success',
              summary: 'MESSAGE.SUCCESS',
              detail: 'MESSAGE.DELETE_SUCCESS',
            });
            this.publicHolidayStateService.setPublicHolidayToEdit(null);
            this.closeModal();
          },
          error: (error) => {
            this.isLoading = false;
            if (error instanceof OccError) { 
              this.showOCCErrorModalHoliday = true;
              this.occErrorHolidayType = error.errorType;
              this.commonMessageService.showErrorDeleteMessage();
            } else if (error?.message.includes('404')) {
              this.showOCCErrorModalHoliday = true;
              this.occErrorHolidayType = 'DELETE_UNEXISTED';
              this.commonMessageService.showErrorDeleteMessage(); 
            } else {
              const errorHolidayMessage = error.error.message ?? '';
              if (errorHolidayMessage.includes('foreign key constraint fails')) {
                this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(errorHolidayMessage);
                this.isVisibleModel.emit(false); 
              } else {
                this.errorMessage = error.message ?? 'Failed to delete publicHoliday';
                this.toastMessage.emit({
                  severity: 'error',
                  summary: 'MESSAGE.ERROR',
                  detail: this.errorMessage?.includes('it is in use by other entities')
                    ? 'MESSAGE.DELETE_FAILED_IN_USE'
                    : 'MESSAGE.DELETE_FAILED',
                });
              }
              this.closeModal();
            }
          },
        });
      this.subscriptions.add(sub);
    }
  }
  public onRefresh(): void {
    if (this.publicHolidayToDelete) {
      localStorage.setItem('selectedPublicHolidayId', this.publicHolidayToDelete.toString());
      globalThis.location.reload();
    }
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const newPublicHoliday = this.getSanitizedPublicHolidayValues();
    let sub;
    if(newPublicHoliday.isFixedDate){
      sub = this.publicHolidayUtils
        .addPublicHoliday(newPublicHoliday)
        .pipe(finalize(() => (this.isLoading = false)))
        .subscribe({
          next: (created) => this.handleSuccess(created),
          error: (error) => {
            this.handleError(error);
          },
        });
    } else {
      sub = this.publicHolidayUtils.addPublicHoliday(newPublicHoliday)
      .pipe(
        switchMap((created) => {
          return this.holidayYearUtils.createHolidayYear({
            date: created.date ?? '',
            year: created.date ?? '',
            publicHoliday: created,
            weekday: 1
          }).pipe(
            map(createdHolidayYear => ({
              publicHoliday: created,
              holidayYear: createdHolidayYear
            }))
          )
        }),
        finalize(() => (this.isLoading = false))
      ).subscribe({
        next: (result) => this.handleSuccess(result.publicHoliday),
        error: (error) => this.handleError(error),
      });
    }
    this.subscriptions.add(sub);
  }

  private handleSuccess(created: PublicHoliday): void {
    this.publicHolidayCreated.emit();
    this.publicHolidayStateService.setPublicHolidayToEdit(created);
    this.toastMessage.emit({
      severity: 'success',
      summary: 'MESSAGE.SUCCESS',
      detail: 'MESSAGE.CREATE_SUCCESS',
    });
    this.handleClose();
  }

  private handleError(error: any): void {
    this.errorMessage = error?.message ?? 'HOLIDAYS.ERROR.CREATION_FAILED';

    const detail = this.getErrorDetail(error.message);

    if(error.message.includes('holiday already exists')){
      this.holidayAlreadyExists = true;
      this.createdPublicHolidayForm.get('name')?.valueChanges.pipe(take(1))
        .subscribe(() => this.holidayAlreadyExists = false);
    }
    this.toastMessage.emit({
      severity: 'error',
      summary: 'MESSAGE.ERROR',
      detail,
    });
  }

  private getErrorDetail(errorCode: string): string {
    switch (errorCode) {
      case 'HOLIDAYS.ERROR.EMPTY':
        return 'MESSAGE.EMPTY_ERROR';
      case 'HOLIDAYS.ERROR.ALREADY_EXISTS':
        return 'MESSAGE.RECORD_ALREADY_EXISTS';
      default:
        return 'MESSAGE.CREATE_FAILED';
    }
  }

  private shouldPreventSubmission(): boolean {
    return this.createdPublicHolidayForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private getSanitizedPublicHolidayValues() {
    return {
      name: this.createdPublicHolidayForm.value.name?.trim() ?? '',
      sequenceNo: this.createdPublicHolidayForm.value.sequenceNo ?? 0,
      isFixedDate: this.createdPublicHolidayForm.value.isFixedDate ?? false,
      date: momentFormatDate(this.createdPublicHolidayForm.value.date),
    };
  }

  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModel.emit(false);
    this.resetForm();
  }

  onCancel(): void {
    this.handleClose();
  }

  closeModal(): void {
    this.isVisibleModel.emit(false);
    this.resetForm();
    setTimeout(() => {
      this.datePicker.writeValue(null);
      this.datePicker.updateInputfield();
    });
  }

  private resetForm(): void {
    this.createdPublicHolidayForm.reset();
    this.createdPublicHolidayForm.markAsPristine();
    this.createdPublicHolidayForm.markAsUntouched();
  }

  private focusInputIfNeeded() {
    if (this.isCreateMode && this.publicHolidayInput) {
      setTimeout(() => {
        if (this.publicHolidayInput?.nativeElement) {
          this.publicHolidayInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}