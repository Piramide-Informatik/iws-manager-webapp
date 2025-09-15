import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { InvoiceTypeUtils } from '../../utils/invoice-type-utils';
import { InvoiceType } from '../../../../../../Entities/invoiceType';

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
  @Output() createInvoiceType = new EventEmitter<{created?: InvoiceType, status: 'success' | 'error'}>();
  @Output() deleteInvoiceType = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;

  public readonly invoiceTypeForm = new FormGroup({
    name: new FormControl('')
  })

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      this.focusInputIfNeeded();
    }
  }

  public onSubmit(): void {
    if(this.invoiceTypeForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newInvoiceType: Omit<InvoiceType, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      name: this.invoiceTypeForm.value.name ?? ''
    };

    this.invoiceTypeUtils.addInvoiceType(newInvoiceType).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createInvoiceType.emit({created, status: 'success'})
      },
      error: () => {
        this.isLoading = false;
        this.createInvoiceType.emit({status: 'error'})
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
          this.deleteInvoiceType.emit({status: 'success'});
        },
        error: (error) => {
          this.isLoading = false;
          this.deleteInvoiceType.emit({ status: 'error', error: error });
        }
      })
    }
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.invoiceTypeForm.reset();
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
}
