import { Component, EventEmitter, Output, Input, inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RoleUtils } from '../../utils/role-utils'; 
import { of, Subscription } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-rol-modal',
  standalone: false,
  templateUrl: './rol-modal.component.html',
  styleUrl: './rol-modal.component.scss'
})
export class RolModalComponent {
  private readonly roleUtils = inject(RoleUtils);
  private readonly subscriptions = new Subscription();

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() roleToDelete: number | null = null;
  @Input() roleName: string | null = null;

  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() roleCreated = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<{severity: string, summary: string, detail: string}>();

  @ViewChild('roleNameInput') roleNameInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  errorMessage: string | null = null;

  readonly createRoleForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ])
  });

  constructor( private readonly commonMessageService: CommonMessagesService) {}

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
    this.roleUtils.deleteRole(this.roleToDelete).subscribe({
      next: () => this.emitDeleteMessage('success'),
      error: (error) => this.emitDeleteMessage('error', error)
    });
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

  private closeAndReset(): void {
    this.stopLoading();
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  private handleRoleExistence(exists: boolean, name: string) {
    if (exists) {
      this.errorMessage = 'MESSAGE.RECORD_ALREADY_EXISTS';
      this.roleCreated.emit();
      this.closeAndReset();
      this.stopLoading()
    }
    this.roleUtils.createNewRole(name).subscribe({
      next: () => this.commonMessageService.showCreatedSuccesfullMessage(),
      error: () => this.commonMessageService.showErrorCreatedMessage(),
      complete: () => {
        this.roleCreated.emit();
        this.closeAndReset();
        this.stopLoading()
      }
    });
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
    return of(null);
  }

  private emitDeleteMessage(type: 'success' | 'error', error?: any): void {
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
      this.errorMessage = error?.message ?? 'Failed to delete role';
      console.error('Delete error:', error);
      this.confirmDelete.emit({
        severity: 'error',
        summary: 'ROLES.MESSAGE.ERROR',
        detail: usedByUser
          ? 'ROLES.MESSAGE.DELETE_ERROR_BY_USER'
          : isInUse
            ? 'ROLES.MESSAGE.DELETE_ERROR_IN_USE'
            : 'ROLES.MESSAGE.DELETE_FAILED'
      });
    }

    this.closeAndReset();
  }
}
