import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TitleUtils } from '../../utils/title-utils';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of, Subscription } from 'rxjs';

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
  @Output() confirmDelete = new EventEmitter<{ severity: string, summary: string, detail: string }>();

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
    this.resetForm();
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
      this.titleUtils.deleteTitle(this.titleToDelete).subscribe({
        next: () => {
          this.isLoading = false;
          this.confirmDelete.emit({
            severity: 'success',
            summary: 'MESSAGE.SUCCESS',
            detail: 'MESSAGE.DELETE_SUCCESS'
          });
          this.closeModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message ?? 'Failed to delete title';
          this.confirmDelete.emit({
            severity: 'error',
            summary: 'MESSAGE.ERROR',
            detail: this.errorMessage?.includes('it is in use by other entities') ? 'MESSAGE.DELETE_ERROR_IN_USE' : 'MESSAGE.DELETE_FAILED'
          });
          console.error('Delete error:', error);
          this.closeModal();
        }
      });
    }
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const titleName = this.getSanitizedTitleName();

    const sub = this.titleUtils.addTitle(titleName).pipe(
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: () => {
        this.titleCreated.emit();
        this.handleClose();
      },
      error: (error) => {
        this.errorMessage = error?.message ?? 'TITLE.ERROR.CREATION_FAILED';
        console.error('Creation error:', error);
      }
    });

    this.subscriptions.add(sub);
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