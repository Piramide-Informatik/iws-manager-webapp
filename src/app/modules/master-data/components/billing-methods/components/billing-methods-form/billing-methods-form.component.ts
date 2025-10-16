import { Component, ElementRef, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { InvoiceTypeUtils } from '../../utils/invoice-type-utils';
import { InvoiceTypeStateService } from '../../utils/invoice-type-state.service';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { Subscription } from 'rxjs';
import { InvoiceType } from '../../../../../../Entities/invoiceType';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-billing-methods-form',
  standalone: false,
  templateUrl: './billing-methods-form.component.html',
  styleUrl: './billing-methods-form.component.scss'
})
export class BillingMethodsFormComponent implements OnInit, OnDestroy {
  private readonly invoiceTypeUtils = inject(InvoiceTypeUtils);
  private readonly invoiceTypeStateService = inject(InvoiceTypeStateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public invoiceTypeToEdit: InvoiceType | null = null;
  public showOCCErrorModalInvoice = false;
  public isLoading: boolean = false;
  billingMethodForm!: FormGroup;
  public occErrorBillingMethodType: OccErrorType = 'UPDATE_UPDATED';

  constructor(){ }

  ngOnInit(): void {
    this.billingMethodForm = new FormGroup({
      name: new FormControl('', [Validators.required])
    });
    this.setupInvoiceTypeSubscription();
    this.loadInvoiceTypeAfterRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
  if (this.billingMethodForm.invalid || !this.invoiceTypeToEdit) return
  this.isLoading = true;
  const editedInvoiceType: InvoiceType = {
    ...this.invoiceTypeToEdit,
    name: this.billingMethodForm.value.name?.trim()
  }

  this.invoiceTypeUtils.updateInvoiceType(editedInvoiceType).subscribe({
    next: () => {
      this.isLoading = false;
      this.clearForm();
      this.commonMessageService.showEditSucessfullMessage();
    },
    error: (error: Error) => {
      this.isLoading = false;
      if (error instanceof OccError) { 
        this.showOCCErrorModalInvoice = true;
        this.occErrorBillingMethodType = error.errorType;
        this.commonMessageService.showErrorEditMessage();
      } else {
        this.commonMessageService.showErrorEditMessage();
      }
    }
  });
}

  private setupInvoiceTypeSubscription(): void {
    this.subscriptions.add(
      this.invoiceTypeStateService.currentInvoiceType$.subscribe(invoiceType => {
        if(invoiceType){
          this.invoiceTypeToEdit = invoiceType;
          this.billingMethodForm.patchValue({
            name: this.invoiceTypeToEdit.name ?? ''
          });
          this.focusInputIfNeeded();
        } else {
          this.billingMethodForm.reset();
        }
      })
    )
  }

  public onRefresh(): void {
    if (this.invoiceTypeToEdit?.id) {
      localStorage.setItem('selectedInvoiceTypeId', this.invoiceTypeToEdit.id.toString());
      globalThis.location.reload();
    }
  }

  public clearForm(): void {
    this.billingMethodForm.reset();
    this.invoiceTypeStateService.clearInvoiceType();
    this.invoiceTypeToEdit = null;
  }

  private loadInvoiceTypeAfterRefresh(): void {
    const savedInvoiceTypeId = localStorage.getItem('selectedInvoiceTypeId');
    if (savedInvoiceTypeId) {
      this.isLoading = true;
      this.subscriptions.add(
        this.invoiceTypeUtils.getInvoiceTypeById(Number(savedInvoiceTypeId)).subscribe({
          next: (invoiceType) => {
            if (invoiceType) {
              this.invoiceTypeStateService.setInvoiceTypeToEdit(invoiceType);
            }
            this.isLoading = false;
            localStorage.removeItem('selectedInvoiceTypeId');
          },
          error: () => {
            this.isLoading = false;
            localStorage.removeItem('selectedInvoiceTypeId');
          }
        })
      );
    }
  }

  private focusInputIfNeeded(): void {
    if (this.invoiceTypeToEdit && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}