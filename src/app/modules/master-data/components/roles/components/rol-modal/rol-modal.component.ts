import { Component, EventEmitter, Output, Input, inject, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { RoleUtils } from '../../utils/role-utils'; 
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

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

    this.roleUtils.roleExists(name).pipe(
      switchMap(exists => this.handleRoleExistence(exists, name)),
      catchError(err => this.handleError('ROLES.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.stopLoading())
    ).subscribe(result => {
      if (result !== null) {
        this.roleCreated.emit();
        this.closeAndReset();
      }
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
      return of(null);
    }
    return this.roleUtils.createNewRole(name).pipe(
      catchError(err => this.handleError('ROLES.ERROR.CREATION_FAILED', err))
    );
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
      this.errorMessage = error?.message ?? 'Failed to delete role';
      console.error('Delete error:', error);
      this.confirmDelete.emit({
        severity: 'error',
        summary: 'ROLES.MESSAGE.ERROR',
        detail: isInUse
          ? 'ROLES.MESSAGE.DELETE_ERROR_IN_USE'
          : 'ROLES.MESSAGE.DELETE_FAILED'
      });
    }

    this.closeAndReset();
  }
}
