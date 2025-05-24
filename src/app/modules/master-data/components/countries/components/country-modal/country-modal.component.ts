import { Component, EventEmitter, Output, Input, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
// Importa tu utilidad para países, similar a TitleUtils
// import { CountryUtils } from '../../utils/country-utils';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-country-modal',
  standalone: false,
  templateUrl: './country-modal.component.html',
  styleUrl: './country-modal.component.scss'
})
export class CountryModalComponent implements OnInit {
  // private readonly countryUtils = inject(CountryUtils);

  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() countryToDelete: number | null = null;
  @Input() countryName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() countryCreated = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<number>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly createCountryForm = new FormGroup({
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
    if (this.countryToDelete) {
      // this.countryUtils.deleteCountry(this.countryToDelete).subscribe({
      //   next: () => {
      //     this.isLoading = false;
      //     this.confirmDelete.emit();
      //     this.closeModal();
      //   },
      //   error: (error) => {
      //     this.isLoading = false;
      //     this.errorMessage = error.message ?? 'Failed to delete country';
      //     console.error('Delete error:', error);
      //   }
      // });
    }
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const countryName = this.getSanitizedCountryName();

    // this.countryUtils.countryExists(countryName).pipe(
    //   switchMap(exists => this.handleCountryExistence(exists, countryName)),
    //   catchError(err => this.handleError('COUNTRY.ERROR.CHECKING_DUPLICATE', err)),
    //   finalize(() => this.isLoading = false)
    // ).subscribe();

    this.handleClose();
  }

  private shouldPreventSubmission(): boolean {
    return this.createCountryForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private getSanitizedCountryName(): string {
    return this.createCountryForm.value.name?.trim() ?? '';
  }

  // private handleCountryExistence(exists: boolean, countryName: string) {
  //   if (exists) {
  //     this.errorMessage = 'COUNTRY.ERROR.ALREADY_EXISTS';
  //     return of(null);
  //   }
  //   return this.countryUtils.createNewCountry(countryName).pipe(
  //     catchError(err => this.handleError('COUNTRY.ERROR.CREATION_FAILED', err))
  //   );
  // }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
    return of(null);
  }

  private resetForm(): void {
    this.createCountryForm.reset();
  }

  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.createCountryForm.reset();
  }

  onCancel(): void {
    this.handleClose();
  }
}