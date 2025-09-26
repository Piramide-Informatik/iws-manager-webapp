import { Component, EventEmitter, Output, Input, inject, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApprovalStatusUtils } from '../../../utils/approval-status-utils';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { ApprovalStatus } from '../../../../../../../Entities/approvalStatus';

@Component({
  selector: 'app-modal-approval-status',
  standalone: false,
  templateUrl: './modal-approval-status.component.html',
  styleUrl: './modal-approval-status.component.scss'
})
export class ModalApprovalStatusComponent implements OnInit, OnChanges, OnDestroy {
  private readonly approvalStatusUtils = inject(ApprovalStatusUtils);
  private readonly subscriptions = new Subscription();

  @ViewChild('approvalStatusNameInput') approvalStatusNameInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visibleModal: boolean = false;
  @Input() approvalStatusToDelete: number | null = null;
  @Input() approvalStatusName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() approvalStatusCreated = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{
    severity: string;
    summary: string;
    detail: string;
  }>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createApprovalStatusForm = new FormGroup({
    status: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    order: new FormControl(null),
    isProject: new FormControl(false),
    isNetwork: new FormControl(false)
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visibleModal'] && this.visibleModal){
      this.focusInputIfNeeded();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  closeAndReset(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  onDeleteConfirm(): void {
    if (!this.approvalStatusToDelete) return;
    this.isLoading = true;

    const sub = this.approvalStatusUtils
      .deleteApprovalStatus(this.approvalStatusToDelete)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => this.showToastAndClose('success', 'MESSAGE.DELETE_SUCCESS'),
        error: (error) =>
          this.handleOperationError(
            error,
            'MESSAGE.DELETE_FAILED',
            'MESSAGE.DELETE_ERROR_IN_USE'
          ),
      });

    this.subscriptions.add(sub);
  }

  onSubmit(): void {
    if (this.createApprovalStatusForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    const ApprovalStatusData = this.getSanitizedApprovalStatusValues();
    const sub = this.approvalStatusUtils
      .createNewApprovalStatus(ApprovalStatusData)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          this.approvalStatusCreated.emit();
          this.showToastAndClose('success', 'MESSAGE.CREATE_SUCCESS');
        },
        error: (error) =>
          this.handleOperationError(error, 'MESSAGE.CREATE_FAILED'),
      });

    this.subscriptions.add(sub);
  }


  private loadInitialData(){
    const sub = this.approvalStatusUtils.loadInitialData().subscribe();
    this.subscriptions.add(sub);
  }

  onCancel(): void {
    this.handleClose();
  }

  private showToastAndClose(severity: string, detail: string): void {
    this.toastMessage.emit({
      severity,
      summary: severity === 'success' ? 'MESSAGE.SUCCESS' : 'MESSAGE.ERROR',
      detail,
    });
    this.closeAndReset();
  }

  private handleOperationError(
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
    this.closeAndReset();
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

  private getSanitizedApprovalStatusValues(): Omit<ApprovalStatus, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
    return {
      status: this.createApprovalStatusForm.value.status?.trim() ?? '',
      sequenceNo: this.createApprovalStatusForm.value.order ?? 0,
      forProjects: this.createApprovalStatusForm.value.isProject ? 1 : 0,
      forNetworks: this.createApprovalStatusForm.value.isNetwork ? 1 : 0
    };
  }


  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  private resetForm(): void {
    this.createApprovalStatusForm.reset();
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.createApprovalStatusForm.reset();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.approvalStatusNameInput) {
      setTimeout(() => {
        this.approvalStatusNameInput?.nativeElement?.focus();
      }, 150);
    }
  }
}
