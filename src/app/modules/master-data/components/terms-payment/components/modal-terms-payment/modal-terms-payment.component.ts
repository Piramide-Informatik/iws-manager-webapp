import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { PayConditionUtils } from '../../utils/pay-condition-utils';
import { PayCondition } from '../../../../../../Entities/payCondition';
import { FormControl, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-modal-terms-payment',
  standalone: false,
  templateUrl: './modal-terms-payment.component.html',
  styleUrl: './modal-terms-payment.component.scss'
})
export class ModalTermsPaymentComponent implements OnChanges {
  private readonly payConditionUtils = inject(PayConditionUtils);
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() isVisible: boolean = false;
  @Input() termPayment!: PayCondition 
  @Output() createPayCondition = new EventEmitter<{created?: PayCondition, status: 'success' | 'error'}>();
  @Output() deletePayCondition = new EventEmitter<{status: 'success' | 'error', error?: Error}>();
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  public isLoading: boolean = false;

  public readonly payConditionForm = new FormGroup({
    name: new FormControl(''),
    deadline: new FormControl(null),
    text: new FormControl('')
  });

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['isVisible'] && this.isVisible && this.modalType !== 'delete'){
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }

  onSubmit(): void {
    if(this.payConditionForm.invalid || this.isLoading) return

    this.isLoading = true;
    const newPayCondition: Omit<PayCondition, 'id' | 'createdAt'| 'updatedAt' | 'version'> = {
      name: this.payConditionForm.value.name ?? '',
      deadline: this.payConditionForm.value.deadline ?? 0,
      text: this.payConditionForm.value.text ?? ''
    }

    this.payConditionUtils.addPayCondition(newPayCondition).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.closeModal();
        this.createPayCondition.emit({ created, status: 'success' });
      },
      error: () => {
        this.isLoading = false;
        this.createPayCondition.emit({ status: 'error' });
      }
    });
  }

  confirmDelete(): void {
    this.isLoading = true;
    this.payConditionUtils.deletePayCondition(this.termPayment.id).subscribe({
      next: () => {
        this.isLoading = false;
        this.closeModal();
        this.deletePayCondition.emit({ status: 'success' });
      },
      error: (error) => {
        this.isLoading = false;
        this.deletePayCondition.emit({ status: 'error', error });
      }
    });
  }

  public closeModal(): void {
    this.isVisibleModal.emit(false);
    this.payConditionForm.reset();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  public focusInputIfNeeded(): void {
    if (this.isCreateMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
