import { Component, EventEmitter, Output, Input, inject, OnInit, ViewChild, ElementRef, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import { FormGroup, FormControl} from '@angular/forms';
import { ApprovalStatusUtils } from '../../../utils/approval-status-utils';
import { finalize } from 'rxjs/operators';
import { Subscription, Observable } from 'rxjs';
import { ApprovalStatus } from '../../../../../../../Entities/approvalStatus';
import { OccError, OccErrorType } from '../../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-modal-approval-status',
  standalone: false,
  templateUrl: './modal-approval-status.component.html',
  styleUrl: './modal-approval-status.component.scss',
})
export class ModalApprovalStatusComponent
  implements OnInit, OnChanges, OnDestroy
{
  private readonly approvalStatusUtils = inject(ApprovalStatusUtils);
  private readonly subscriptions = new Subscription();

  @ViewChild('approvalStatusNameInput')
  approvalStatusNameInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visibleModal = false;
  @Input() approvalStatusToDelete: number | null = null;
  @Input() approvalStatusName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() approvalStatusCreated = new EventEmitter<void>();
  @Output() approvalStatusDeleted = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{
    severity: string;
    summary: string;
    detail: string;
  }>();
  showOCCErrorModalApprovalStatus = false;
  public occErrorApprovalStatusType: OccErrorType = 'UPDATE_UNEXISTED';
  isLoading = false;
  errorMessage: string | null = null;

  readonly createApprovalStatusForm = new FormGroup({
    status: new FormControl(''),
    order: new FormControl(null),
    isProject: new FormControl(false),
    isNetwork: new FormControl(false),
  });

  constructor(private readonly commonMessageService: CommonMessagesService) {}

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visibleModal'] && this.visibleModal) {
      this.focusInputIfNeeded();
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  // ========================
  //  PUBLIC METHODS
  // ========================

  onDeleteConfirm(): void {
    if (!this.approvalStatusToDelete) return;
    this.runOperation(
      this.approvalStatusUtils.deleteApprovalStatus(this.approvalStatusToDelete),
      {
        success: 'MESSAGE.DELETE_SUCCESS',
        fail: 'MESSAGE.DELETE_FAILED',
        inUse: 'MESSAGE.DELETE_ERROR_IN_USE',
      }
    );
  }

  onSubmit(): void {
    if (this.createApprovalStatusForm.invalid || this.isLoading) return;
    const ApprovalStatusData = this.getSanitizedApprovalStatusValues();

    this.runOperation(
      this.approvalStatusUtils.createNewApprovalStatus(ApprovalStatusData),
      {
        success: 'MESSAGE.CREATE_SUCCESS',
        fail: 'MESSAGE.CREATE_FAILED',
      },
      () => this.approvalStatusCreated.emit()
    );
  }

  onCancel(): void {
    this.closeModal();
  }

  // ========================
  //  PRIVATE HELPERS
  // ========================

  private loadInitialData(): void {
    const sub = this.approvalStatusUtils.loadInitialData().subscribe();
    this.subscriptions.add(sub);
  }

  /**
   * Método centralizado para operaciones (create, delete, update)
   */
  private runOperation<T>(
    operation$: Observable<T>,
    messages: { success: string; fail: string; inUse?: string },
    onSuccess?: () => void
  ): void {
    this.isLoading = true;
    this.errorMessage = null;

    const sub = operation$
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          onSuccess?.();
          if (messages.success == 'MESSAGE.DELETE_SUCCESS') {
            this.approvalStatusDeleted.emit();
          }
          this.emitToast('success', messages.success);
          this.closeModal();
        },
        error: (error) =>
        {
          if (messages.fail.includes('DELETE')) {
            if (error instanceof OccError || error?.message.includes('404')) {
              this.showOCCErrorModalApprovalStatus = true;
              this.occErrorApprovalStatusType = 'DELETE_UNEXISTED';
            }
          }  
          this.handleOperationError(error, messages.fail, messages.inUse)
        }
      });

    this.subscriptions.add(sub);
  }

  private emitToast(severity: string, detail: string): void {
    this.toastMessage.emit({
      severity,
      summary: severity === 'success' ? 'MESSAGE.SUCCESS' : 'MESSAGE.ERROR',
      detail,
    });
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
    const errorApprovalStatusMessage = error.error.message ?? '';  
    if (errorApprovalStatusMessage.includes('foreign key constraint fails')) {
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(errorApprovalStatusMessage);
    } else {
      this.emitToast('error', detail);
    }
    

    console.error('Operation error:', error);
    this.closeModal();
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

  private getSanitizedApprovalStatusValues(): Omit<
    ApprovalStatus,
    'id' | 'createdAt' | 'updatedAt' | 'version'
  > {
    return {
      status: this.createApprovalStatusForm.value.status ? this.createApprovalStatusForm.value.status.trim() : '',
      sequenceNo: this.createApprovalStatusForm.value.order ?? 0,
      forProjects: this.createApprovalStatusForm.value.isProject ? 1 : 0,
      forNetworks: this.createApprovalStatusForm.value.isNetwork ? 1 : 0,
    };
  }

  private closeModal(reset: boolean = true): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    if (reset) this.resetForm();
  }

  private resetForm(): void {
    this.createApprovalStatusForm.reset();
  }

  public focusInputIfNeeded(): void {
    if (this.isCreateMode && this.approvalStatusNameInput) {
      setTimeout(() => {
        this.approvalStatusNameInput?.nativeElement?.focus();
      }, 150);
    }
  }
}
