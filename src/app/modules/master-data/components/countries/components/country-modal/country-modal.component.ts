import { Component, EventEmitter, Output, Input, inject, OnInit, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CountryUtils } from '../../utils/country-util';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { take } from 'rxjs/operators';

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
  @Output() confirmDelete = new EventEmitter<{ severity: string, summary: string, detail: string }>();
  @ViewChild('countryNameInput') countryNameInput!: ElementRef<HTMLInputElement>;

  isLoading = false;
  errorMessage: string | null = null;
  public showOCCErrorModalCountry = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public nameAlreadyExist = false;
  public abbreviationAlreadyExist = false;

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  readonly createCountryForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    abbreviation: new FormControl('', [Validators.required]),
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

    this.countryUtils.createNewCountry(name, label, isDefault).subscribe({
      next: () => {
        this.countryUtils.loadInitialData().subscribe();
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.sendDefaultCountryMessage();
        this.handleClose();
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        if (error.message?.includes('name already exists')) {
          this.nameAlreadyExist = true;
          this.createCountryForm.get('name')?.valueChanges.pipe(take(1))
            .subscribe(() => this.nameAlreadyExist = false);
          this.commonMessageService.showErrorCreatedMessage();
        } else if (error.message?.includes('abbreviation already exists')) {
          this.abbreviationAlreadyExist = true;
          this.createCountryForm.get('abbreviation')?.valueChanges.pipe(take(1))
            .subscribe(() => this.abbreviationAlreadyExist = false);
          this.commonMessageService.showErrorCreatedMessage();
        } else {
          this.commonMessageService.showErrorCreatedMessage();
          this.handleClose();
        }
      }
    });
  }

  private sendDefaultCountryMessage(): void {
    const isDefaultCountry = this.createCountryForm.value?.isStandard!;
    if (isDefaultCountry === true) {
      this.commonMessageService.showCustomSeverityAndMessageWithValue(
        'warn',
        'COUNTRIES.MESSAGE.SUCCESS',
        'COUNTRIES.MESSAGE.DEFAULT_COUNTRY',
        this.createCountryForm.value.name?.toString(),
        true
      )
    }
    else {
      this.countryCreated.emit();
    }
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
    if (error.error?.message?.includes('a foreign key constraint fails')) {
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
      this.closeModal();
    }
  }

  private handleOccDeleteError(error: any): void {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.commonMessageService.showErrorDeleteMessage();
      this.showOCCErrorModalCountry = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  private shouldPreventSubmission(): boolean {
    return this.createCountryForm.invalid || this.isLoading || this.isSaveDisabled || this.nameAlreadyExist || this.abbreviationAlreadyExist;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private resetForm(): void {
    this.createCountryForm.reset();
    this.nameAlreadyExist = false;
    this.abbreviationAlreadyExist = false;
  }

  handleClose(): void {
    this.isLoading = false;
    this.nameAlreadyExist = false;
    this.abbreviationAlreadyExist = false;
    this.isVisibleModal.emit(false);
    this.resetForm();
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.createCountryForm.reset();
    this.nameAlreadyExist = false;
    this.abbreviationAlreadyExist = false;
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
  get isSaveDisabled(): boolean {
    const nameValue = this.createCountryForm.get('name')?.value?.trim();
    const abbreviationValue = this.createCountryForm.get('abbreviation')?.value?.trim();
    const hasAtLeastOneField = !!nameValue || !!abbreviationValue;

    return this.createCountryForm.invalid || this.isLoading || !hasAtLeastOneField;
  }
}