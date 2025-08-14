import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserUtils } from '../../utils/user-utils';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-user-modal',
  standalone: false,
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.scss'
})
export class UserModalComponent implements OnInit, OnDestroy {
  private readonly userUtils = inject(UserUtils);
  private readonly subscriptions = new Subscription();

  @ViewChild('userInput') userInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() userToDelete: number | null = null;
  @Input() userName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() userCreated = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{ severity: string, summary: string, detail: string }>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createUserForm = new FormGroup({
    username: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    firstName: new FormControl('',[
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    lastName: new FormControl('',[
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    password: new FormControl('',[
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ]),
    email: new FormControl('',[
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(100)
    ])
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
  }

  private loadInitialData() {
    const sub = this.userUtils.loadInitialData().subscribe();
    this.subscriptions.add(sub);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onDeleteConfirm(): void {
    this.isLoading = true;

    if (this.userToDelete) {
      const sub = this.userUtils.deleteUser(this.userToDelete).pipe(
        finalize(() => this.isLoading = false)
      ).subscribe({
        next: () => {
          this.toastMessage.emit({
            severity: 'success',
            summary: 'MESSAGE.SUCCESS',
            detail: 'MESSAGE.DELETE_SUCCESS'
          });
          this.closeModal();
        },
        error: (error) => {
          this.errorMessage = error.message ?? 'Failed to delete user';
          this.toastMessage.emit({
            severity: 'error',
            summary: 'MESSAGE.ERROR',
            detail: this.errorMessage?.includes('it is in use by other entities')
              ? 'MESSAGE.DELETE_ERROR_IN_USE'
              : 'MESSAGE.DELETE_FAILED'
          });
          console.error('Delete error:', error);
          this.closeModal();
        }
      });

      this.subscriptions.add(sub);
    }
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const userName = this.getSanitizedUserValues();
    console.log(userName)

    const sub = this.userUtils.addUser(userName.username, userName.firstName, userName.lastName, userName.password, userName.email).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => this.handleError(error)
    });

    this.subscriptions.add(sub);
  }

  private handleSuccess(): void {
    this.toastMessage.emit({
      severity: 'success',
      summary: 'MESSAGE.SUCCESS',
      detail: 'MESSAGE.CREATE_SUCCESS'
    });
    this.userCreated.emit();
    this.handleClose();
  }

  private handleError(error: any): void {
    this.errorMessage = error?.message ?? 'TITLE.ERROR.CREATION_FAILED';

    const detail = this.getErrorDetail(error.message);

    this.toastMessage.emit({
      severity: 'error',
      summary: 'MESSAGE.ERROR',
      detail
    });

    console.error('Creation error:', error);
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

  private shouldPreventSubmission(): boolean {
    return this.createUserForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private getSanitizedUserValues(): {
    username: string;
    firstName: string;
    lastName: string;
    password: string;
    email: string;
  } {
    return {
      username: this.createUserForm.value.username?.trim() ?? '',
      firstName: this.createUserForm.value.firstName?.trim() ?? '',
      lastName: this.createUserForm.value.lastName?.trim() ?? '',
      password: this.createUserForm.value.password?.trim() ?? '',
      email: this.createUserForm.value.email?.trim() ?? ''
    };

  }

  private resetForm(): void {
    this.createUserForm.reset();
  }

  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.createUserForm.reset();
  }

  onCancel(): void {
    this.handleClose();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.userInput) {
      setTimeout(() => {
        if (this.userInput?.nativeElement) {
          this.userInput.nativeElement.focus();
        }
      }, 150);
    }
  }
}
