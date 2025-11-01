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
  private subscriptions = new Subscription();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  public invoiceTypeToEdit: InvoiceType | null = null;
  public showOCCErrorModalInvoice = false;
  public isLoading: boolean = false;
  billingMethodForm!: FormGroup;
  public occErrorBillingMethodType: OccErrorType = 'UPDATE_UPDATED';
  public nameAlreadyExist: boolean = false;
  private allInvoiceTypes: InvoiceType[] = [];

  constructor(){ }

  ngOnInit(): void {
    this.billingMethodForm = new FormGroup({
      name: new FormControl('', [Validators.required])
    });
    this.setupInvoiceTypeSubscription();
    this.loadInvoiceTypeAfterRefresh();
    this.loadAllInvoiceTypes();
  }

  ngOnDestroy(): void {
    this.clearSubscriptions();
  }

  onSubmit(): void {
    if (this.billingMethodForm.invalid || !this.invoiceTypeToEdit || this.nameAlreadyExist) return;
    
    this.isLoading = true;
    const editedInvoiceType: InvoiceType = {
      ...this.invoiceTypeToEdit,
      name: this.billingMethodForm.value.name?.trim()
    }

    this.invoiceTypeUtils.updateInvoiceType(editedInvoiceType).subscribe({
      next: () => {
        this.isLoading = false;
        this.commonMessageService.showEditSucessfullMessage();
        this.loadAllInvoiceTypes();
        this.clearForm();
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
          this.nameAlreadyExist = false;
          this.setupNameValidation();
          this.focusInputIfNeeded();
        } else {
          this.billingMethodForm.reset();
          this.nameAlreadyExist = false;
        }
      })
    )
  }

  private loadAllInvoiceTypes(): void {
    const loadSubscription = this.invoiceTypeUtils.getAllInvoiceTypes().subscribe({
      next: (invoiceTypes) => {
        this.allInvoiceTypes = invoiceTypes;
      },
      error: (error) => {
        console.error('Error loading invoice types:', error);
      }
    });
    this.subscriptions.add(loadSubscription);
  }

  private setupNameValidation(): void {
    const nameControl = this.billingMethodForm.get('name');
    if (nameControl) {
      const nameSubscription = nameControl.valueChanges.subscribe(value => {
        this.checkNameUniqueness(value || '');
      });
      this.subscriptions.add(nameSubscription);
    }
  }

  private checkNameUniqueness(name: string): void {
    if (!name?.trim()) {
      this.nameAlreadyExist = false;
      return;
    }

    const trimmedName = name.trim().toLowerCase();
    const currentName = this.invoiceTypeToEdit?.name?.trim().toLowerCase();
    
    const existingType = this.allInvoiceTypes.find(type => {
      const typeName = type.name?.trim().toLowerCase();
      return typeName === trimmedName && typeName !== currentName;
    });

    this.nameAlreadyExist = !!existingType;
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
    this.nameAlreadyExist = false;
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

  private clearSubscriptions(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
    this.subscriptions = new Subscription();
  }
}