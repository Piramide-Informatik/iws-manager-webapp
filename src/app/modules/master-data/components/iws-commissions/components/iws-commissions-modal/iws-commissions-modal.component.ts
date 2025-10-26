import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, OnDestroy, OnChanges, SimpleChanges, } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { IwsCommissionUtils } from '../../utils/iws-commision-utils';
import { finalize, take } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { IwsCommission } from '../../../../../../Entities/iws-commission ';
import { InputNumber } from 'primeng/inputnumber';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-iws-commissions-modal',
  standalone: false,
  templateUrl: './iws-commissions-modal.component.html',
  styleUrl: './iws-commissions-modal.component.scss',
})
export class IwsCommissionsModalComponent implements OnInit, OnDestroy, OnChanges {
  private readonly iwsCommissionUtils = inject(IwsCommissionUtils);
  private readonly subscriptions = new Subscription();

  @ViewChild('firstInput') firstInput!: InputNumber;

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() iwsCommissionToDelete: number | null = null;
  @Input() iwsCommissionName: string | null = null;
  @Input() isVisible: boolean = false;

  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() iwsCommissionCreated = new EventEmitter<{status: 'success' | 'error'}>();
  @Output() iwsCommissionDeleted = new EventEmitter<{status: 'success' | 'error' | 'related entity', message?: string}>();
  @Output() toastMessage = new EventEmitter<{
    severity: string;
    summary: string;
    detail: string;
  }>();

  isLoading = false;
  errorMessage: string | null = null;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalIwsCommission = false;
  public thresholdAlreadyExist = false;

  readonly createIwsCommissionForm = new FormGroup({
    fromOrderValue: new FormControl(null, [Validators.required]),
    commission: new FormControl(null, [Validators.max(100)]),
    minCommission: new FormControl(null),
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
    
    this.createIwsCommissionForm.get('fromOrderValue')?.valueChanges.subscribe(() => {
      if (this.thresholdAlreadyExist) {
        this.thresholdAlreadyExist = false;
      }
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['isVisible'] && this.isVisible) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private loadInitialData() {
    const sub = this.iwsCommissionUtils.loadInitialData().subscribe();
    this.subscriptions.add(sub);
  }

  private closeModal(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  onCancel(): void {
    this.closeModal();
  }

  onDeleteConfirm(): void {
    if (!this.iwsCommissionToDelete) return;
    this.isLoading = true;

    const sub = this.iwsCommissionUtils
      .deleteIwsCommission(this.iwsCommissionToDelete)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.iwsCommissionDeleted.emit({status: 'success'});
          this.showToastAndClose('success', 'MESSAGE.DELETE_SUCCESS')
        },
        error: (error) => {
          this.handleDeleteError(error)
        }
      });

    this.subscriptions.add(sub);
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalIwsCommission = true;
      this.occErrorType = 'DELETE_UNEXISTED';
      this.iwsCommissionDeleted.emit({status: 'error'});
    } else if (error instanceof HttpErrorResponse && error.status === 500 && error.error.message.includes('foreign key constraint')){
      this.iwsCommissionDeleted.emit({status: 'related entity', message: error.error.message});
    } else {
      this.iwsCommissionDeleted.emit({status: 'error'});
    }
  }

  onSubmit(): void {
    if (this.createIwsCommissionForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;
    this.thresholdAlreadyExist = false;

    const IwsCommissionData = this.getSanitizedIwsCommissionValues();

    const sub = this.iwsCommissionUtils
      .addIwsCommission(IwsCommissionData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.iwsCommissionCreated.emit({status: 'success'});
          this.showToastAndClose('success', 'MESSAGE.CREATE_SUCCESS');
        },
        error: (error) => {
          this.handleCreateError(error);
        }
      });

    this.subscriptions.add(sub);
  }

  private handleCreateError(error: any): void {
    if (error?.message?.includes('threshold already exists')) {
      this.thresholdAlreadyExist = true;
      this.toastMessage.emit({
        severity: 'error',
        summary: 'MESSAGE.ERROR',
        detail: 'IWS_COMMISSIONS.ERROR.THRESHOLD_ALREADY_EXIST',
      });
      this.iwsCommissionCreated.emit({status: 'error'});
    } else if (error?.message?.includes('Threshold is required')) {
      this.toastMessage.emit({
        severity: 'error',
        summary: 'MESSAGE.ERROR',
        detail: 'ERROR.FIELD_REQUIRED',
      });
      this.iwsCommissionCreated.emit({status: 'error'});
    } else {
      this.handleErrorWithToast(error, 'MESSAGE.CREATE_FAILED');
      this.iwsCommissionCreated.emit({status: 'error'});
    }
  }

  private showToastAndClose(severity: string, detail: string): void {
    this.toastMessage.emit({
      severity,
      summary: severity === 'success' ? 'MESSAGE.SUCCESS' : 'MESSAGE.ERROR',
      detail,
    });
    this.closeModal();
  }

  private handleErrorWithToast(
    error: any,
    defaultDetail: string,
    inUseDetail?: string
  ): void {
    this.errorMessage = error?.message ?? defaultDetail;

    const detail = this.errorMessage?.includes('it is in use by other entities')
      ? inUseDetail ?? defaultDetail
      : this.getErrorDetail(this.errorMessage ?? '');

    this.toastMessage.emit({
      severity: 'error',
      summary: 'MESSAGE.ERROR',
      detail,
    });

    console.error('Operation error:', error);
  }

  private getErrorDetail(errorCode: string): string {
    switch (errorCode) {
      case 'TITLE.ERROR.EMPTY':
        return 'MESSAGE.EMPTY_ERROR';
      case 'TITLE.ERROR.ALREADY_EXISTS':
        return 'MESSAGE.RECORD_ALREADY_EXISTS';
      default:
        return 'MESSAGE.CREATE_FAILED';
    }
  }

  private getSanitizedIwsCommissionValues(): Omit<
    IwsCommission,
    'id' | 'createdAt' | 'updatedAt' | 'version'
  > {
    return {
      fromOrderValue: Number(this.createIwsCommissionForm.value.fromOrderValue),
      commission: Number(this.createIwsCommissionForm.value.commission),
      minCommission: Number(this.createIwsCommissionForm.value.minCommission),
    };
  }

  private resetForm(): void {
    this.createIwsCommissionForm.reset();
    this.thresholdAlreadyExist = false;
  }

  public focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        this.firstInput.input.nativeElement?.focus();
      }, 200);
    }
  }
}