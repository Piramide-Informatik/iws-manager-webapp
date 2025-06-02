import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CompanyTypeUtils } from '../../utils/type-of-companies.utils';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { emptyValidator } from '../../utils/empty.validator';

@Component({
  selector: 'app-type-of-companies-modal',
  standalone: false,
  templateUrl: './type-of-companies-modal.component.html',
  styleUrl: './type-of-companies-modal.component.scss'
})

export class TypeOfCompaniesModalComponent implements OnInit {
  private readonly companyTypeUtils = inject(CompanyTypeUtils);
  @ViewChild('companyTypeInput') companyTypeInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() companyTypeToDelete: number | null = null;
  @Input() companyTypeName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() companyTypeCreated = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<number>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly companyTypeForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      emptyValidator()
    ])
  });

  ngOnInit(): void {
    this.companyTypeForm.reset();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onCompnayDeleteConfirm(): void {
    this.isLoading = true;
    if(this.companyTypeToDelete){
      this.companyTypeUtils.deleteCompanyType(this.companyTypeToDelete).subscribe({
        next: () => {
          this.isLoading = false;
          this.confirmDelete.emit(); 
          this.closeModal();
        },
        error: (error) => {
          this.isLoading = false;
          this.errorMessage = error.message ?? 'Failed to delete company type';
          console.error('Delete error:', error);
        }
      });
    }
  }  

  onCompanyTypeSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const companyName = this.companyTypeForm.value.name || '';

    this.companyTypeUtils.companyTypeExists(companyName).pipe(
      switchMap(exists => this.handleCompanyTypeExistence(exists, companyName)),
      catchError(err => this.handleError('TITLE.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.isLoading = false)
    ).subscribe();

    this.handleClose();
  }

  private shouldPreventSubmission(): boolean {
    return this.companyTypeForm.invalid || this.isLoading;
  }

  private prepareForSubmission(): void {
    this.isLoading = true;
    this.errorMessage = null;
  }

  private handleCompanyTypeExistence(exists: boolean, companyName: string) {
    if (exists) {
      this.errorMessage = 'TYPE_OF_COMPANIES.ERROR.COMPANY_TYPE_ALREADY_EXIST';
      return of(null);
    }

    return this.companyTypeUtils.createNewCompanyType(companyName).pipe(
      catchError(err => this.handleError('TITLE.ERROR.CREATION_FAILED', err))
    );
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
    return of(null);
  }

  handleClose(): void {
    this.isLoading = false;
    this.isVisibleModal.emit(false);
    this.companyTypeForm.reset();
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.companyTypeForm.reset();
  }

  onCancel(): void {
    this.handleClose();
  }

  public focusCompanyTypeInputIfNeeded() {
    if (this.isCreateMode && this.companyTypeInput) {
      setTimeout(() => {
        if (this.companyTypeInput?.nativeElement) {
          this.companyTypeInput.nativeElement.focus(); 
        }
      }, 150); 
    }
  }
}