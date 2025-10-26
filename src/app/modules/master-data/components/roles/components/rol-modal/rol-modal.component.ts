import { Component, EventEmitter, Output, Input, inject, ViewChild, ElementRef, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RoleUtils } from '../../utils/role-utils';
import { finalize, of, Subscription } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { RoleStateService } from '../../utils/role-state.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-rol-modal',
  standalone: false,
  templateUrl: './rol-modal.component.html',
  styleUrl: './rol-modal.component.scss'
})
export class RolModalComponent implements OnInit {
  private readonly roleUtils = inject(RoleUtils);
  private readonly roleStateService = inject(RoleStateService);
  private readonly subscriptions = new Subscription();
  public showOCCErrorModalRole = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() roleToDelete: number | null = null;
  @Input() roleName: string | null = null;

  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() roleCreated = new EventEmitter<{ status: 'success' | 'error' }>();
  @Output() confirmDelete = new EventEmitter<{ severity: string, summary: string, detail: string, relatedEntity?: string }>();

  @ViewChild('roleNameInput') roleNameInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  errorMessage: string | null = null;

  readonly createRoleForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(50)
    ])
  });

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  ngOnInit(): void {
    this.resetForm();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.startLoading();
    const { name } = this.getRoleFormValues();

    this.roleUtils.roleExists(name).subscribe({
      next: (exists) => this.handleRoleExistence(exists, name),
      error: (err) => this.handleError('ROLES.ERROR.CHECKING_DUPLICATE', err)
    });
  }

  onDeleteConfirm(): void {
    if (!this.roleToDelete) return;

    this.startLoading();
    const sub = this.roleUtils.deleteRole(this.roleToDelete).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.confirmDelete.emit({
          severity: 'success',
          summary: 'MESSAGE.SUCCESS',
          detail: 'MESSAGE.DELETE_SUCCESS'
        });
        this.commonMessageService.showDeleteSucessfullMessage();
        this.closeAndReset();
      },
      error: (error) => {
        this.handleDeleteError(error);
        this.errorMessage = error.error.message ?? 'a foreign key constraint fails';
        if (this.errorMessage?.includes('foreign key constraint fails')) {
          this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(this.errorMessage);
          this.closeAndReset();
        }
      }
    });
    this.subscriptions.add(sub);
  }

  handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.commonMessageService.showErrorDeleteMessage();
      this.showOCCErrorModalRole = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  onCancel(): void {
    this.closeAndReset();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.roleNameInput) {
      setTimeout(() => {
        this.roleNameInput?.nativeElement?.focus();
      }, 150);
    }
  }

  // ---------- Helpers centrales ----------
  private resetForm(): void {
    this.createRoleForm.reset();
  }

  private shouldPreventSubmission(): boolean {
    return this.createRoleForm.invalid || this.isLoading;
  }

  private getRoleFormValues() {
    return {
      name: this.createRoleForm.value.name?.trim() ?? ''
    };
  }

  private startLoading(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private stopLoading(): void {
    this.isLoading = false;
  }

  public closeAndReset(): void {
    this.stopLoading();
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  private handleRoleExistence(exists: boolean, name: string) {
  if (exists) {
    this.errorMessage = 'MESSAGE.RECORD_ALREADY_EXISTS';
    this.commonMessageService.showErrorRecordAlreadyExist();
    this.stopLoading();
    return; // ⚠️ importante
  }

  this.roleUtils.createNewRole(name).subscribe({
    next: () => {
      this.commonMessageService.showCreatedSuccesfullMessage();
      this.roleCreated.emit({ status: 'success' });
    },
    error: () => {
      this.commonMessageService.showErrorCreatedMessage();
      this.roleCreated.emit({ status: 'error' });
    },
    complete: () => {
      this.closeAndReset();
      this.stopLoading();
    }
  });
}

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
    return of(null);
  }

  private emitDeleteMessage(type: 'success' | 'error', error?: any): void {
    this.roleStateService.clearRole();
    this.stopLoading();

    if (type === 'success') {
      this.confirmDelete.emit({
        severity: 'success',
        summary: 'ROLES.MESSAGE.SUCCESS',
        detail: 'ROLES.MESSAGE.DELETE_SUCCESS'
      });
    } else {
      const isInUse = error?.message?.includes('it is in use by other entities');
      let usedByUser = false;
      if (error.error) {
        usedByUser = error.error?.message?.includes('Role is assigned to') && error.error?.message?.includes('user');
      }
      if (usedByUser) {
        this.sendDeleteConfirmation('error', 'ROLES.MESSAGE.ERROR', 'ROLES.MESSAGE.DELETE_ERROR_BY_USER');
      } else {
        this.errorMessage = error?.message ?? 'Failed to delete role';
        this.confirmDelete.emit({
          severity: 'error',
          summary: 'ROLES.MESSAGE.ERROR',
          detail: isInUse
            ? 'ROLES.MESSAGE.DELETE_ERROR_IN_USE'
            : 'ROLES.MESSAGE.DELETE_FAILED'
        });
      }
    }
    this.closeAndReset();
  }

  private sendDeleteConfirmation(severity: string, summary: string, detail: string) {
    this.confirmDelete.emit({ severity, summary, detail });
  }
}
