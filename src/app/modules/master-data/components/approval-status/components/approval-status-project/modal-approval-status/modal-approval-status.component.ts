import { Component, EventEmitter, Output, Input, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApprovalStatusUtils } from '../../../utils/approval-status-utils';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-modal-approval-status',
  standalone: false,
  templateUrl: './modal-approval-status.component.html',
  styleUrl: './modal-approval-status.component.scss'
})
export class ModalApprovalStatusComponent implements OnInit {
  private readonly approvalStatusUtils = inject(ApprovalStatusUtils);

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() approvalStatusToDelete: number | null = null;
  @Input() approvalStatusName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() approvalStatusCreated = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<{severity: string, summary: string, detail: string}>();
  @ViewChild('approvalStatusNameInput') approvalStatusNameInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  errorMessage: string | null = null;

  readonly createApprovalStatusForm = new FormGroup({
    status: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    order: new FormControl(0,[
      Validators.required,
      Validators.pattern('^[0-9]+$')]),
    isProject: new FormControl(false),
    isNetwork: new FormControl(false)
  });

  ngOnInit(): void {
      this.resetForm();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const { status, order, isProject, isNetwork } = this.getApprovalStatusFormValues();

    this.approvalStatusUtils.approvalStatusExists(status).pipe(
      switchMap(exists => this.handleCountryExistence(exists, status, order, isProject, isNetwork)),
      catchError(err => this.handleError('APPROVAL_STATUS.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.isLoading = false)
    ).subscribe(result => {
      if (result !== null) {
        this.approvalStatusCreated.emit();
        this.handleClose();
      }
    });
  }

  onDeleteConfirm(): void {
    this.isLoading = true;
    if (this.approvalStatusToDelete) {
      this.approvalStatusUtils.deleteApprovalStatus(this.approvalStatusToDelete).subscribe({
        next: () => this.handleDeleteSuccess(),
        error: (error) => this.handleDeleteError(error)
      });
    }
  }

  private handleDeleteSuccess(): void {
  this.isLoading = false;
  this.confirmDelete.emit({
    severity: 'success',
    summary: 'APPROVAL_STATUS.MESSAGE.SUCCESS',
    detail: 'APPROVAL_STATUS.MESSAGE.DELETE_SUCCESS'
  });
  this.closeModal();
}

private handleDeleteError(error: any): void {
  this.isLoading = false;
  this.errorMessage = error.message ?? 'Failed to delete approval status';
  console.error('Delete error:', error);
  this.confirmDelete.emit({
    severity: 'error',
    summary: 'APPROVAL_STATUS.MESSAGE.ERROR',
    detail: this.errorMessage?.includes('it is in use by other entities')
      ? 'APPROVAL_STATUS.MESSAGE.DELETE_ERROR_IN_USE'
      : 'APPROVAL_STATUS.MESSAGE.DELETE_FAILED'
  });
  this.closeModal();
}

  onCancel(): void {
    this.handleClose();
  }

  private shouldPreventSubmission(): boolean {
    return this.createApprovalStatusForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private getApprovalStatusFormValues() {
    return {
      status: this.createApprovalStatusForm.value.status?.trim() ?? '',
      order: this.createApprovalStatusForm.value.order ?? 0,
      isProject: this.createApprovalStatusForm.value.isProject ? 1 : 0,
      isNetwork: this.createApprovalStatusForm.value.isNetwork ? 1 : 0
    };
  }

  private handleCountryExistence(
    exists: boolean,
    status: string,
    order: number ,
    isProject: number ,
    isNetwork: number
  ) {
    if (exists) {
      this.errorMessage = 'MESSAGE.RECORD_ALREADY_EXISTS';
      return of(null);
    }
    return this.approvalStatusUtils.createNewApprovalStatus(status, order, isProject, isNetwork).pipe(
      catchError(err => this.handleError('APPROVAL_STATUS.ERROR.CREATION_FAILED', err))
    );
    
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
    return of(null);
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
