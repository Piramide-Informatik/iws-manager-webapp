import { Component, EventEmitter, Output, Input, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CountryUtils } from '../../utils/country-util';
import { of } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

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
  @Output() confirmDelete = new EventEmitter<{severity: string, summary: string, detail: string}>();
  @ViewChild('countryNameInput') countryNameInput!: ElementRef<HTMLInputElement>;
  
  isLoading = false;
  errorMessage: string | null = null;
  public showOCCErrorModalCountry = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';

  constructor(private readonly commonMessageService: CommonMessagesService) {}

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

    this.countryUtils.countryExists(name).subscribe({
      next: (exists) => this.handleCountryExistence(exists, name, label, isDefault),
      error: (err) => this.handleError('COUNTRY.ERROR.CHECKING_DUPLICATE', err),
    })
  }
  onDeleteConfirm(): void {
    this.isLoading = true;
    if (this.countryToDelete) {
      this.countryUtils.deleteCountry(this.countryToDelete).subscribe({
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
          this.handleEntityRelatedError(error);
          this.handleOccDeleteError(error);
          this.confirmDelete.emit({
            severity: 'error',
            summary: 'MESSAGE.ERROR',
            detail: this.errorMessage?.includes('it is in use by other entities') ? 'MESSAGE.DELETE_ERROR_IN_USE' : 'MESSAGE.DELETE_FAILED'
          });
        }
      });
    }
  }
  private handleEntityRelatedError(error: any): void {
    if(error.error?.message?.includes('a foreign key constraint fails')) {
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
    }
  }
  private handleOccDeleteError(error: any): void {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalCountry = true;
      this.occErrorType = 'DELETE_UNEXISTED';
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
      this.countryCreated.emit();
      this.handleClose();
      this.isLoading = false;
      return;
    }
    this.countryUtils.createNewCountry(name, label, isDefault).subscribe({
      next: () => {
        this.commonMessageService.showCreatedSuccesfullMessage();
      },
      error: () => {
        this.commonMessageService.showErrorCreatedMessage();
      },
      complete: () => {
        this.countryCreated.emit();
        this.handleClose();
        this.isLoading = false;
      }
    })
    
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

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.countryNameInput) {
      setTimeout(() => {
        this.countryNameInput?.nativeElement?.focus();
      }, 150);
    }
  }
}