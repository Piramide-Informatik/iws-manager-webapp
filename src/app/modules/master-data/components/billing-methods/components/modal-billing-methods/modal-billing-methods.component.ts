import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InvoiceTypeUtils } from '../../utils/invoice-type-utils';
import { InvoiceType } from '../../../../../../Entities/invoiceType';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-modal-billing-methods',
  standalone: false,
  templateUrl: './modal-billing-methods.component.html',
  styleUrl: './modal-billing-methods.component.scss'
})
export class ModalBillingMethodsComponent implements OnChanges {
  private readonly invoiceTypeUtils = inject(InvoiceTypeUtils);
  @Input() selectedInvoiceType!: InvoiceType | undefined;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visible: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() createInvoiceType = new EventEmitter<{ created?: InvoiceType, status: 'success' | 'error' }>();
  @Output() deleteInvoiceType = new EventEmitter<{ status: 'success' | 'error', error?: Error }>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;
  public nameAlreadyExist: boolean = false;
  private allInvoiceTypes: InvoiceType[] = [];
  private subscriptions = new Subscription(); 

  public readonly invoiceTypeForm = new FormGroup({
    name: new FormControl('', [Validators.required])
  })
  public showOCCErrorModalBillingMethod = false;
  public occErrorBillingMethodType: OccErrorType = 'UPDATE_UNEXISTED';

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] && this.visible) {
      this.invoiceTypeForm.reset();
      this.nameAlreadyExist = false;
      this.loadAllInvoiceTypes();
      
      setTimeout(() => {
        this.focusInputIfNeeded();
      }, 100);
    }
    
    if (changes['visible'] && !this.visible) {
      this.clearSubscriptions();
    }
  }

  public onSubmit(): void {
    if (this.invoiceTypeForm.invalid || this.isLoading || this.nameAlreadyExist) return;

    this.isLoading = true;
    const newInvoiceType: Omit<InvoiceType, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.invoiceTypeForm.value.name?.trim()
    };

    this.invoiceTypeUtils.addInvoiceType(newInvoiceType).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createInvoiceType.emit({ created, status: 'success' })
      },
      error: (error) => {
        this.isLoading = false;
        this.createInvoiceType.emit({ status: 'error' })
      }
    })
  }

  deleteBillingMethod() {
    this.isLoading = true;
    if (this.selectedInvoiceType) {
      this.invoiceTypeUtils.deleteInvoiceType(this.selectedInvoiceType.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.closeModal();
          this.deleteInvoiceType.emit({ status: 'success' });
        },
        error: (error) => {
          this.isLoading = false;
          if (error instanceof OccError || error?.message.includes('404')) {
            this.showOCCErrorModalBillingMethod = true;
            this.occErrorBillingMethodType = 'DELETE_UNEXISTED';
          }
          const errorInvoiceTypeMessage = error.error.message ?? '';
          if (errorInvoiceTypeMessage.includes('foreign key constraint fails')) {
            this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(errorInvoiceTypeMessage);
            this.isVisibleModal.emit(false);
            return;
          }
          this.deleteInvoiceType.emit({ status: 'error', error: error });
        }
      })
    }
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.invoiceTypeForm.reset();
    this.nameAlreadyExist = false;
    this.clearSubscriptions();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  private focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }

  private loadAllInvoiceTypes(): void {
    this.clearSubscriptions();
    
    this.subscriptions.add(
      this.invoiceTypeUtils.getAllInvoiceTypes().subscribe({
        next: (invoiceTypes) => {
          this.allInvoiceTypes = invoiceTypes;
          this.setupNameValidation();
        },
        error: (error) => {
          console.error('Error loading invoice types:', error);
        }
      })
    );
  }

  private setupNameValidation(): void {
    const nameControl = this.invoiceTypeForm.get('name');
    if (nameControl) {
      this.subscriptions.add(
        nameControl.valueChanges.subscribe(value => {
          this.checkNameUniqueness(value || '');
        })
      );
    }
  }

  private checkNameUniqueness(name: string): void {
    if (!name || !name.trim()) {
      this.nameAlreadyExist = false;
      return;
    }

    const trimmedName = name.trim().toLowerCase();
    const existingType = this.allInvoiceTypes.find(type => 
      type.name?.toLowerCase() === trimmedName
    );

    this.nameAlreadyExist = !!existingType;
  }

  private clearSubscriptions(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    this.subscriptions = new Subscription();
  }
}