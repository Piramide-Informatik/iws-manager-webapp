import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TitleUtils } from '../../utils/title-utils';
import { finalize } from 'rxjs/operators';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-title-modal',
  standalone: false,
  templateUrl: './title-modal.component.html',
  styleUrls: ['./title-modal.component.scss']
})

export class TitleModalComponent implements OnInit, OnDestroy {
  private readonly titleUtils = inject(TitleUtils);
  private subscriptions = new Subscription();

  @ViewChild('titleInput') titleInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() titleToDelete: number | null = null;
  @Input() titleName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() titleCreated = new EventEmitter<void>();
  @Output() toastMessage = new EventEmitter<{ severity: string, summary: string, detail: string }>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createTitleForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ])
  });

  ngOnInit(): void {
    this.loadInitialData();
    this.resetForm();
  }

  private loadInitialData() {
    const sub = this.titleUtils.loadInitialData().subscribe();
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

    if (this.titleToDelete) {
      const sub = this.titleUtils.deleteTitle(this.titleToDelete).pipe(
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
          this.errorMessage = error.message ?? 'Failed to delete title';
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
    const titleName = this.getSanitizedTitleName();

    const sub = this.titleUtils.addTitle(titleName).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => this.handleSuccess(),
      error: (error) => this.handleError(error)
    });

    this.subscriptions.add(sub);
  }


  // onSubmit(): void {
  //   if (this.shouldPreventSubmission()) return;

  //   this.prepareForSubmission();
  //   const titleName = this.getSanitizedTitleName();

  //   const sub = this.titleUtils.addTitle(titleName).pipe(
  //     finalize(() => this.isLoading = false)
  //   ).subscribe({
  //     next: () => {
  //       this.titleCreated.emit();
  //       this.toastMessage.emit({
  //         severity: 'success',
  //         summary: 'MESSAGE.SUCCESS',
  //         detail: 'MESSAGE.CREATE_SUCCESS'
  //       });
  //       this.handleClose();
  //     },
  //     error: (error) => {
  //       this.errorMessage = error?.message ?? 'TITLE.ERROR.CREATION_FAILED';
  //       console.error('Creation error:', error);
  //     }
  //   });

  //   this.subscriptions.add(sub);
  // }

  private handleSuccess(): void {
    this.toastMessage.emit({
      severity: 'success',
      summary: 'MESSAGE.SUCCESS',
      detail: 'MESSAGE.CREATE_SUCCESS'
    });
    this.titleCreated.emit();
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
    return this.createTitleForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private getSanitizedTitleName(): string {
    return this.createTitleForm.value.name?.trim() ?? '';
  }

  private resetForm(): void {
    this.createTitleForm.reset();
  }

  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.createTitleForm.reset();
  }

  onCancel(): void {
    this.handleClose();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.titleInput) {
      setTimeout(() => {
        if (this.titleInput?.nativeElement) {
          this.titleInput.nativeElement.focus();
        }
      }, 150);
    }
  }
}