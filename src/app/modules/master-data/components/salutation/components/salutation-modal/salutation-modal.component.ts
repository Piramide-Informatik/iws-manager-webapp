import { Component, ElementRef, EventEmitter, Input, OnInit, Output, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SalutationUtils } from '../../utils/salutation.utils';
import { catchError, finalize, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-salutation-modal',
  standalone: false,
  templateUrl: './salutation-modal.component.html',
  styleUrl: './salutation-modal.component.scss'
})
export class SalutationModalComponent implements OnInit {
  private readonly salutationUtils = inject(SalutationUtils);
  @ViewChild('salutationInput') salutationInput!: ElementRef<HTMLInputElement>;

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() salutationToDelete: number | null = null;
  @Input() salutationName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() salutationCreated = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<{ severity: string, summary: string, detail: string }>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createSalutationForm = new FormGroup({
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

  onDeleteConfirm(): void {
    this.isLoading = true;
    if(this.salutationToDelete){
      this.salutationUtils.deleteSalutation(this.salutationToDelete).subscribe({
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
          this.errorMessage = error.message ?? 'Failed to delete salutation';
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
    const salutationName = this.getSanitizedSalutationName();

    this.salutationUtils.salutationExists(salutationName).pipe(
      switchMap(exists => this.handleSalutationExistence(exists, salutationName)),
      catchError(err => this.handleError('SALUTATION.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.isLoading = false)
    ).subscribe();

    this.handleClose();
  }

  private shouldPreventSubmission(): boolean {
    return this.createSalutationForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private getSanitizedSalutationName(): string {
    return this.createSalutationForm.value.name?.trim() ?? '';
  }

  private handleSalutationExistence(exists: boolean, salutationName: string) {
    if (exists) {
      this.errorMessage = 'SALUTATION.ERROR.ALREADY_EXISTS';
      return of(null);
    }

    return this.salutationUtils.createNewSalutation(salutationName).pipe(
      catchError(err => this.handleError('SALUTATION.ERROR.CREATION_FAILED', err))
    );
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
    return of(null);
  }

  private resetForm(): void {
    this.createSalutationForm.reset();
  }

  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.createSalutationForm.reset();
  }

  onCancel(): void {
    this.handleClose();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.salutationInput) {
      setTimeout(() => {
        if (this.salutationInput?.nativeElement) {
          this.salutationInput.nativeElement.focus(); 
        }
      }, 150); 
    }
  }
}
