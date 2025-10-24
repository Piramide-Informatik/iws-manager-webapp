import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { PublicHolidayUtils } from '../../utils/public-holiday-utils';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { momentCreateDate, momentFormatDate } from '../../../../../shared/utils/moment-date-utils';
import { PublicHolidayStateService } from '../../utils/public-holiday-state.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
@Component({
  selector: 'app-holiday-modal',
  standalone: false,
  templateUrl: './holiday-modal.component.html',
  styleUrl: './holiday-modal.component.scss',
})
export class HolidayModalComponent implements OnInit, OnDestroy, OnChanges {
  private readonly publicHolidayUtils = inject(PublicHolidayUtils);
  private readonly publicHolidayStateService = inject(PublicHolidayStateService);
  private readonly commonMessageService = inject(CommonMessagesService); 
  private readonly subscriptions = new Subscription();
  @ViewChild('publicHolidayInput') publicHolidayInput!: ElementRef<HTMLInputElement>;
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

  readonly createdPublicHolidayForm = new FormGroup({
    name: new FormControl(''),
    date: new FormControl(''),
    sequenceNo: new FormControl({value: null, disabled: true}),
  });

  constructor() {} 

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      });
    }
    
    if (changes['visible'] && this.visible && this.isCreateMode) {
      this.resetForm();
      this.publicHolidayUtils.getPublicHolidaysSequenceSort().subscribe(sequence => {
        this.createdPublicHolidayForm.get('sequenceNo')?.setValue(sequence as any);
      })
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
            this.closeModel();
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
              console.error('Error deleting publicHoliday:', error);
              this.closeModel();
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
    const publicHoliday = this.getSanitizedPublicHolidayValues();

    const sub = this.publicHolidayUtils
      .addPublicHoliday(publicHoliday)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.handleSuccess(),
        error: (error) => {
          this.handleError(error);
        },
      });
    this.subscriptions.add(sub);
  }

  private handleSuccess(): void {
    this.toastMessage.emit({
      severity: 'success',
      summary: 'MESSAGE.SUCCESS',
      detail: 'MESSAGE.CREATE_SUCCESS',
    });
    this.publicHolidayCreated.emit();
    this.handleClose();
  }

  private handleError(error: any): void {
    this.errorMessage = error?.message ?? 'HOLIDAYS.ERROR.CREATION_FAILED';

    const detail = this.getErrorDetail(error.message);

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
      date: this.createdPublicHolidayForm.value.date
        ? momentFormatDate(
            momentCreateDate(this.createdPublicHolidayForm.value.date)
          )
        : '',
      sequenceNo: Number(this.createdPublicHolidayForm.getRawValue().sequenceNo),
      isFixedDate: true,
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

  closeModel(): void {
    this.isVisibleModel.emit(false);
    this.resetForm();
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