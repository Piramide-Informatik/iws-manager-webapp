import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { PayConditionUtils } from '../../utils/pay-condition-utils';
import { PayConditionStateService } from '../../utils/pay-condition-state.services';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';
import { PayCondition } from '../../../../../../Entities/payCondition';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'master-data-edit-term-payment',
  standalone: false,
  templateUrl: './edit-term-payment.component.html',
  styleUrl: './edit-term-payment.component.scss'
})
export class EditTermPaymentComponent implements OnInit, OnDestroy {
  private readonly payConditionUtils = inject(PayConditionUtils);
  private readonly payConditionStateService = inject(PayConditionStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  private payToEdit: PayCondition | null = null;
  public showOCCErrorModaPay = false;
  public isLoading: boolean = false;
  public editTermPaymentForm!: FormGroup;
  public occErrorTermPaymentType: OccErrorType = 'UPDATE_UPDATED';

  ngOnInit(): void {
    this.editTermPaymentForm = new FormGroup({
      name: new FormControl(''),
      deadline: new FormControl(''),
      text: new FormControl(''),
    });
    this.setupPaySubscription();
    this.loadPayAfterRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
  if(this.editTermPaymentForm.invalid || !this.payToEdit) return

  this.isLoading = true;
  const editedPay: PayCondition = {
    ...this.payToEdit,
    name: this.editTermPaymentForm.value.name?.trim(),
    deadline: this.editTermPaymentForm.value.deadline,
    text: this.editTermPaymentForm.value.text?.trim()
  };

  this.payConditionUtils.updatePayCondition(editedPay).subscribe({
    next: () => {
      this.isLoading = false;
      this.clearForm();
      this.commonMessageService.showEditSucessfullMessage();
    },
    error: (error: Error) => {
      this.isLoading = false;
      if (error instanceof OccError) { 
        this.showOCCErrorModaPay = true;
        this.occErrorTermPaymentType = error.errorType;
        this.commonMessageService.showErrorEditMessage();
      } else {
        this.commonMessageService.showErrorEditMessage();
      }
    }
  });
}

  private setupPaySubscription(): void {
    this.subscriptions.add(
      this.payConditionStateService.currentPayCondition$.subscribe(payCondition => {
        if(payCondition){
          this.payToEdit = payCondition;
          this.editTermPaymentForm.patchValue({
            name: this.payToEdit.name,
            deadline: this.payToEdit.deadline,
            text: this.payToEdit.text
          });
          this.focusInputIfNeeded();
        } else {
          this.editTermPaymentForm.reset();
        }
      })
    )
  }

  public onRefresh(): void {
    if (this.payToEdit?.id) {
      localStorage.setItem('selectedPayId', this.payToEdit.id.toString());
      globalThis.location.reload();
    }
  }

  public clearForm(): void {
    this.editTermPaymentForm.reset();
    this.payConditionStateService.clearPayCondition();
    this.payToEdit = null;
  }

  private loadPayAfterRefresh(): void {
    const savedPayId = localStorage.getItem('selectedPayId');
    if (savedPayId) {
      this.isLoading = true;
      this.subscriptions.add(
        this.payConditionUtils.getPayConditionById(Number(savedPayId)).subscribe({
          next: (payCondition) => {
            if (payCondition) {
              this.payConditionStateService.setPayConditionToEdit(payCondition);
            }
            this.isLoading = false;
            localStorage.removeItem('selectedPayId');
          },
          error: () => {
            this.isLoading = false;
            localStorage.removeItem('selectedPayId');
          }
        })
      );
    }
  }

  private focusInputIfNeeded(): void {
    if (this.payToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 150);
    }
  }
}