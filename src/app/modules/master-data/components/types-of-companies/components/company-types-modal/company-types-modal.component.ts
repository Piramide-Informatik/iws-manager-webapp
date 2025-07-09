import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CompanyTypeUtils } from '../../utils/type-of-companies.utils';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { emptyValidator } from '../../utils/empty.validator';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-company-types-modal',
  standalone: false,
  templateUrl: './company-types-modal.component.html',
  styleUrl: './company-types-modal.component.scss'
})

export class TypeOfCompaniesModalComponent implements OnInit {
  private readonly companyTypeUtils = inject(CompanyTypeUtils);
  @ViewChild('companyTypeInput') companyTypeInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() companyTypeToDelete: number | null = null;
  @Input() companyTypeName: string | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() companyTypeCreated = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<{severity: string, summary: string, detail: string}>();

  isLoading = false;
  errorMessage: string | null = null;

  readonly companyTypeForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      emptyValidator()
    ])
  });

  constructor(private readonly messageService: MessageService,
              private readonly translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.companyTypeForm.reset();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onCompanyDeleteConfirm(): void {
    this.isLoading = true;
    if(this.companyTypeToDelete){
      this.companyTypeUtils.deleteCompanyType(this.companyTypeToDelete).subscribe({
        next: () => {
          this.handleDeletionCompanyType({
            severity: 'success',
            summary: 'MESSAGE.SUCCESS',
            detail: 'MESSAGE.DELETE_SUCCESS'
          });
        },
        error: (error) => {
          const errorMessage = error.message.includes('it is in use by other entities') ? 'MESSAGE.DELETE_ERROR_IN_USE' : 'MESSAGE.DELETE_FAILED';
          this.handleDeletionCompanyType({
            severity: 'error',
            summary: 'MESSAGE.ERROR',
            detail: errorMessage,
            error: error
          });
        }
      });
    }
  }  

  handleDeletionCompanyType(message: {severity: string, summary: string, detail: string, error?: any}): void {
    this.isLoading = false;
    if (message.error) {
      this.errorMessage = message.error.message ?? 'Failed to delete company type';
      console.error('Deletion error:', message.error);
    }
    this.confirmDelete.emit({
      severity: message.severity,
      summary: message.summary,
      detail: message.detail
    });
    this.closeModal();
  }

  onCompanyTypeSubmit(): void {
    if (this.shouldPreventSubmission()) return;

    this.prepareForSubmission();
    const companyName = this.companyTypeForm.value.name ?? '';

    this.companyTypeUtils.companyTypeExists(companyName).pipe(
      switchMap(exists => this.handleCompanyTypeExistence(exists, companyName)),
      catchError(err => this.handleError('TITLE.ERROR.CHECKING_DUPLICATE', err)),
      finalize(() => this.isLoading = false)
    ).subscribe({
      next: (data) => {
        if (data !== null) {
          this.onCreateCompanyTypeSuccessfully()
        }
      }
    });

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
      this.messageService.add({
        severity: 'error',
        summary: this.translateService.instant('TYPE_OF_COMPANIES.MESSAGE.ERROR'),
        detail: this.translateService.instant(this.errorMessage)
      });
      return of(null);
    }

    return this.companyTypeUtils.createNewCompanyType(companyName).pipe(
      catchError(err => this.handleError('TYPE_OF_COMPANIES.ERROR.CREATION_FAILED', err))
    )
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
    return of(null);
  }

  private onCreateCompanyTypeSuccessfully() {
    this.messageService.add({
      severity: 'success',
      summary: this.translateService.instant('TYPE_OF_COMPANIES.MESSAGE.SUCCESS'),
      detail: this.translateService.instant('TYPE_OF_COMPANIES.MESSAGE.CREATE_SUCCESS')
    });
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