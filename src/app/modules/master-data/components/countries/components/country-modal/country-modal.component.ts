import { Component, EventEmitter, Output, Input, inject, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CountryUtils } from '../../utils/country-util';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';

@Component({
  selector: 'app-country-modal',
  standalone: false,
  templateUrl: './country-modal.component.html',
  styleUrl: './country-modal.component.scss'
})
export class CountryModalComponent implements OnInit {
  private readonly countryUtils = inject(CountryUtils);

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
    ]),
    abbreviation: new FormControl('', [
      Validators.required,
      Validators.maxLength(10)
    ]),
    isStandard: new FormControl(false)
  });

  ngOnInit(): void {
    this.resetForm();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const { name, label, isDefault } = this.getCountryFormValues();

    this.countryUtils.countryExists(name).pipe(
      switchMap(exists => this.handleCountryExistence(exists, name, label, isDefault)),
      catchError(err => this.handleError('COUNTRY.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.isLoading = false)
    ).subscribe(result => {
      if (result !== null) {
        this.countryCreated.emit();
        this.handleClose();
      }
    });
  }
  onDeleteConfirm(): void {
    this.isLoading = true;
    if (this.countryToDelete) {
      this.countryUtils.deleteCountry(this.countryToDelete).subscribe({
        next: () => {
          this.isLoading = false;
          this.confirmDelete.emit();
          this.closeModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message ?? 'Failed to delete country';
          console.error('Delete error:', error);
        }
      });
    }
  }
  private handleCountryExistence(
    exists: boolean,
    name: string,
    label: string,
    isDefault: boolean
  ) {
    if (exists) {
      this.errorMessage = 'COUNTRY.ERROR.ALREADY_EXISTS';
      return of(null);
    }
    return this.countryUtils.createNewCountry(name, label, isDefault).pipe(
      catchError(err => this.handleError('COUNTRY.ERROR.CREATION_FAILED', err))
    );
  }
  private shouldPreventSubmission(): boolean {
    return this.createCountryForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

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
  private getCountryFormValues() {
    return {
      name: this.createCountryForm.value.name?.trim() ?? '',
      label: this.createCountryForm.value.abbreviation?.trim() ?? '',
      isDefault: !!this.createCountryForm.value.isStandard
    };
  }
}