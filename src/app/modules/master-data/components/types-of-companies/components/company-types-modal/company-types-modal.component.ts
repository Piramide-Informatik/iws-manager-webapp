import { Component, EventEmitter, Output, inject, OnInit, Input, ViewChild, ElementRef, OnChanges, SimpleChanges} from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CompanyTypeUtils } from '../../utils/type-of-companies.utils';
import { emptyValidator } from '../../utils/empty.validator';
import { CompanyType } from '../../../../../../Entities/companyType';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-company-types-modal',
  standalone: false,
  templateUrl: './company-types-modal.component.html',
  styleUrl: './company-types-modal.component.scss'
})

export class TypeOfCompaniesModalComponent implements OnInit, OnChanges {
  private readonly companyTypeUtils = inject(CompanyTypeUtils);
  @ViewChild('companyTypeInput') companyTypeInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() companyTypeToDelete: number | null = null;
  @Input() companyTypeName: string | null = null;
  @Input() visible: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() companyTypeCreated = new EventEmitter<void>();
  @Output() confirmDelete = new EventEmitter<{severity: string, summary: string, detail: string}>();
  public showOCCErrorModalCompanyType = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  isLoading = false;
  errorMessage: string | null = null;

  readonly companyTypeForm = new FormGroup({
    name: new FormControl('', [
      Validators.required,
      emptyValidator()
    ])
  });

  constructor(private readonly commonMessageService: CommonMessagesService) {}

  ngOnInit(): void {
    this.companyTypeForm.reset();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      setTimeout(() => {
        this.focusCompanyTypeInputIfNeeded();
      })
    }
    if(changes['visible'] && !this.visible){
      this.companyTypeForm.reset();
    }
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
          this.handleDeleteError(error);
          this.handleDeletionCompanyType({
            severity: 'error',
            summary: 'MESSAGE.ERROR',
            detail: 'MESSAGE.DELETE_FAILED',
            error: error
          });
        }
      });
    }
  }  

  private handleDeleteError(error: Error) {
    if (error instanceof OccError || error?.message.includes('404')) {
      this.showOCCErrorModalCompanyType = true;
      this.occErrorType = 'DELETE_UNEXISTED';
    }
  }

  handleDeletionCompanyType(message: {severity: string, summary: string, detail: string, error?: any}): void {
    this.isLoading = false;
    this.closeModal();
    if (message.error) {
      this.errorMessage = message.error.message ?? 'Failed to delete company type';
      console.error('Deletion error:', message.error);
    }
    this.confirmDelete.emit({
      severity: message.severity,
      summary: message.summary,
      detail: message.detail
    });
  }

  onCompanyTypeSubmit(): void {
    if (this.companyTypeForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;
    const companyType: Omit<CompanyType, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.companyTypeForm.value.name?.trim() ?? ''
    };

    this.companyTypeUtils.createNewCompanyType(companyType).subscribe({
      next: () => {
        this.isLoading = false;
        this.companyTypeUtils.loadInitialData().subscribe();
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.closeModal();      
      },
      error: (err) => {
        this.isLoading = false;
        this.handleError(err.message, err)
      }
    });
  }

  private handleError(messageKey: string, error: any) {
    this.errorMessage = messageKey;
    console.error('Error:', error);
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.companyTypeForm.reset();
  }

  private focusCompanyTypeInputIfNeeded() {
    if (this.isCreateMode && this.companyTypeInput) {
      setTimeout(() => {
        if (this.companyTypeInput?.nativeElement) {
          this.companyTypeInput.nativeElement.focus(); 
        }
      }, 200); 
    }
  }
}