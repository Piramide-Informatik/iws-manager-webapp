import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { SalutationUtils } from '../../utils/salutation.utils';
import { of } from 'rxjs';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { Salutation } from '../../../../../../Entities/salutation';
import { SalutationStateService } from '../../utils/salutation-state.service';

@Component({
  selector: 'app-salutation-modal',
  standalone: false,
  templateUrl: './salutation-modal.component.html',
  styleUrl: './salutation-modal.component.scss'
})
export class SalutationModalComponent implements OnChanges {
  private readonly salutationUtils = inject(SalutationUtils);
  private readonly salutationStateService = inject(SalutationStateService);
  @ViewChild('salutationInput') salutationInput!: ElementRef<HTMLInputElement>;
  @Input() selectedSalutation!: Salutation | undefined;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() salutationToDelete: number | null = null;
  @Input() salutationName: string | null = null;
  @Input() visible: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() salutationCreated = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<{ severity: string, summary: string, detail: string }>();
  @Output() onCreateSalutation = new EventEmitter<{ created?: Salutation, status: 'success' | 'error' }>();
  @Output() onDeleteSalutation = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();

  isLoading = false;
  errorMessage: string | null = null;
  public showOCCErrorModaFunding = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public showOCCErrorModalSalutation = false;

  readonly createSalutationForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(50)
    ])
  });

  constructor(private readonly commonMessageService: CommonMessagesService) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
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
          this.salutationStateService.clearSalutation();
          this.onDeleteSalutation.emit({ status: 'success' });
          this.closeModal();
        },
        error: (errorResponse) => {
          this.isLoading = false;
          this.handleEntityRelatedError(errorResponse)
          this.handleDeleteError(errorResponse);
        }
      });
    }
  } 
  private handleEntityRelatedError(error: any): void {
    if(error.error?.message?.includes('a foreign key constraint fails')) {
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
      this.closeModal();
    }
  }
  private handleDeleteError(error: any):void {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalSalutation = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const salutationName = this.getSanitizedSalutationName();

    this.salutationUtils.salutationExists(salutationName).subscribe({
      next: (exists => this.handleSalutationExistence(exists, salutationName)),
      error: (err => this.handleError('SALUTATION.ERROR.CHECKING_DUPLICATE', err))
    })
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
      this.isLoading = false;
      this.handleClose();
      return;
    }
    this.salutationUtils.createNewSalutation(salutationName).subscribe({
      next: () => this.commonMessageService.showCreatedSuccesfullMessage(),
      error: (err) => this.commonMessageService.showErrorCreatedMessage(),
      complete: () => {
        this.isLoading = false;
        this.handleClose();
      }
    })
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
      }, 250); 
    }
  }
}
