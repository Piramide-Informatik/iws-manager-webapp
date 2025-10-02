import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnDestroy, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { UserUtils } from '../../utils/user-utils';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';
import { PasswordDirective } from 'primeng/password';
import { TranslateService } from '@ngx-translate/core';
import { UserStateService } from '../../utils/user-state.service';

@Component({
  selector: 'app-user-modal',
  standalone: false,
  templateUrl: './user-modal.component.html',
  styleUrl: './user-modal.component.scss'
})
export class UserModalComponent implements OnInit, OnDestroy, OnChanges {
  private readonly userUtils = inject(UserUtils);
  private readonly userStateService = inject(UserStateService);
  private readonly subscriptions = new Subscription();

  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() userToDelete: number | null = null;
  @Input() userName: string | null = null;
  @Input() visibleModal: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() userCreated = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{ severity: string, summary: string, detail: string }>();

  private langSubscription!: Subscription;
  @ViewChild('passwordCreateContainer') passwordCreateContainer!: PasswordDirective;

  isLoading = false;
  errorMessage: string | null = null;

  readonly createUserForm = new FormGroup({
    username: new FormControl(''),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
    password: new FormControl(''),
    email: new FormControl('',  [Validators.email]),
    active: new FormControl(false),
  });

  constructor(private readonly translate: TranslateService) {}

  ngOnInit(): void {
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.passwordCreateContainer.weakLabel = this.translate.instant('USERS.PASSWORD_LABEL.WEAK');
      this.passwordCreateContainer.mediumLabel = this.translate.instant('USERS.PASSWORD_LABEL.MEDIUM');
      this.passwordCreateContainer.strongLabel = this.translate.instant('USERS.PASSWORD_LABEL.STRONG');
      this.passwordCreateContainer.promptLabel = this.translate.instant('USERS.PASSWORD_LABEL.ENTER_PASSWORD');
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visibleModal'] && this.visibleModal){
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


  closeAndReset(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  private showToastAndClose(severity: string, detail: string): void {
    this.toastMessage.emit({
      severity,
      summary: severity === 'success' ? 'MESSAGE.SUCCESS' : 'MESSAGE.ERROR',
      detail
    });
    this.userStateService.clearUser();
    this.closeAndReset();
  }

  private handleOperationError(error: any, defaultDetail: string, inUseDetail?: string): void {
    this.errorMessage = error?.message ?? defaultDetail;

    const detail = this.errorMessage?.includes('it is in use by other entities')
      ? inUseDetail ?? defaultDetail
      : this.getErrorDetail(this.errorMessage ?? '');

    this.toastMessage.emit({
      severity: 'error',
      summary: 'MESSAGE.ERROR',
      detail
    });

    console.error('Operation error:', error);
    this.closeAndReset();
  }

  onDeleteConfirm(): void {
    if (!this.userToDelete) return;
    this.isLoading = true;

    const sub = this.userUtils.deleteUser(this.userToDelete).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.showToastAndClose('success', 'MESSAGE.DELETE_SUCCESS'),
      error: (error) => this.handleOperationError(error, 'MESSAGE.DELETE_FAILED', 'MESSAGE.DELETE_ERROR_IN_USE')
    });

    this.subscriptions.add(sub);
  }


  onSubmit(): void {
    if (this.createUserForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    const userData = this.getSanitizedUserValues();

    const sub = this.userUtils.addUser(userData).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.userCreated.emit();
        this.showToastAndClose('success', 'MESSAGE.CREATE_SUCCESS');
      },
      error: (error) => this.handleOperationError(error, 'MESSAGE.CREATE_FAILED')
    });

    this.subscriptions.add(sub);
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

  private getSanitizedUserValues() {
    return {
      username: this.createUserForm.value.username?.trim() ?? '',
      firstName: this.createUserForm.value.firstName?.trim() ?? '',
      lastName: this.createUserForm.value.lastName?.trim() ?? '',
      email: this.createUserForm.value.email?.trim() ?? '',
      password: this.createUserForm.value.password?.trim() ?? '',
      active: this.createUserForm.value.active ?? false
    };
  }

  private resetForm(): void {
    this.createUserForm.reset();
  }

  onCancel(): void {
    this.closeAndReset();
  }

  private focusInputIfNeeded() {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        this.firstInput?.nativeElement?.focus();
      }, 200);
    }
  }
}
