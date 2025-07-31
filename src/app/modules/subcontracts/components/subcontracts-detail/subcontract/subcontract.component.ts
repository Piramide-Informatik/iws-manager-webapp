import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { map, Subscription } from 'rxjs';
import { Subcontract } from '../../../../../Entities/subcontract';
import { SubcontractUtils } from '../../../utils/subcontracts-utils';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContractorUtils } from '../../../../contractor/utils/contractor-utils';
import { ActivatedRoute, Router } from '@angular/router';
import { Contractor } from '../../../../../Entities/contractor';
import { momentFormatDate } from '../../../../shared/utils/moment-date-utils';
import { Customer } from '../../../../../Entities/customer';
import { CustomerUtils } from '../../../../customer/utils/customer-utils';

@Component({
  selector: 'app-subcontract',
  standalone: false,
  templateUrl: './subcontract.component.html',
  styleUrls: ['./subcontract.component.scss'],
})
export class SubcontractComponent implements OnInit, OnDestroy {
  private readonly subcontractUtils = inject(SubcontractUtils);
  private readonly contractorUtils = inject(ContractorUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly translate = inject(TranslateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private langSubscription!: Subscription;
  public subcontractForm!: FormGroup;
  public showOCCErrorModalSubcontract = false;
  public optionsNetOrGross!: { label: string, value: string }[];

  isLoading = false;

  mode: 'create' | 'edit' = 'create';
  public subcontractToEdit!: Subcontract | null;
  private readonly customerId: number = this.route.snapshot.params['id'];
  subcontractId!: number;
  private contractors: Contractor[] = [];
  public contractorsName = toSignal(
    this.contractorUtils.getAllContractorsByCustomerId(this.customerId).pipe(
      map(contractors => {
        this.contractors = contractors;
        return contractors.map(c => ({ id: c.id, name: c.name }));
      })
    )
  );
  
  public currentCustomer!: Customer | undefined;

  ngOnInit(): void {
    this.loadOptionsInvoiceLabel();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadOptionsInvoiceLabel();
    });

    this.initForm();
    this.checkboxAfaChange();
    
    this.route.params.subscribe(params => {
      this.subcontractId = params['subContractId'];
      if (this.subcontractId) {
        this.mode = 'edit';
        this.subscriptions.add(
          this.subcontractUtils.getSubcontractById(this.subcontractId).subscribe({
            next: (subcontract) => {
              if(subcontract) {
                this.subcontractToEdit = subcontract;
                this.loadSubcontractDataForm(subcontract);
              }
            },
            error: (error) => console.error('Error fetching subcontract:', error)
          })
        );
      } else {
        this.mode = 'create';
        this.getCurrentCustomer();
      }
    })
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  private initForm(): void {
    this.subcontractForm = new FormGroup({
      contractTitle: new FormControl(''),
      contractor: new FormControl(''),
      invoiceNumber: new FormControl(''),
      invoiceDate: new FormControl(''),
      netOrGross: new FormControl(this.optionsNetOrGross[0].value), // default: 'net'
      invoiceAmount: new FormControl(''),
      afa: new FormControl(false), // checkbox
      afaDurationMonths: new FormControl({ value: '', disabled: true }), // solo si afa = true
      description: new FormControl(''),
    });
  }

  private checkboxAfaChange(): void {
    this.subcontractForm.get('afa')?.valueChanges.subscribe((value: boolean) => {
      const afaDurationControl = this.subcontractForm.get('afaDurationMonths');
      if (value) {
        afaDurationControl?.enable();
      } else {
        afaDurationControl?.disable();
        afaDurationControl?.setValue('');
      }
    });
  }

  private loadOptionsInvoiceLabel(): void {
    this.optionsNetOrGross = [
      { label: this.translate.instant('SUB-CONTRACTS.FORM.NET'), value: 'net' },
      { label: this.translate.instant('SUB-CONTRACTS.FORM.GROSS'), value: 'gross' }
    ];
  }

  onSubmit(): void {
    if(this.mode === 'edit') {
      this.updateSubcontract();
    } else {
      this.createSubcontract();
    }
  }

  private createSubcontract(): void {
    if (this.subcontractForm.invalid) {
      console.error('Form is invalid');
      return;
    } 
    this.isLoading = true;
    const newSubcontract = this.buildSubcontractFromForm();
    this.subscriptions.add(
      this.subcontractUtils.createNewSubcontract(newSubcontract).subscribe({
        next: (response: Subcontract) => this.handleCreateSuccess(response),
        error: (error) => this.handleErrorCreated(error)
      })
    );
  }

  private buildSubcontractFromForm(): Omit<Subcontract, 'id'> {
    // controlNetOrGross == true -> invoiceNet, false -> invoiceGross 
    const controlNetOrGross: boolean =  this.subcontractForm.value.netOrGross === 'net';
    return {
      contractTitle: this.subcontractForm.value.contractTitle,
      contractor: this.subcontractForm.value.contractor ? this.getContractorById(this.subcontractForm.value.contractor) : null,
      invoiceNo: this.subcontractForm.value.invoiceNumber,
      invoiceDate: momentFormatDate(this.subcontractForm.value.invoiceDate),
      netOrGross: controlNetOrGross,
      invoiceAmount: this.subcontractForm.value.invoiceAmount,
      isAfa: this.subcontractForm.value.afa,
      afamonths: this.subcontractForm.value.afa ? this.subcontractForm.value.afaDurationMonths : 0,
      description: this.subcontractForm.value.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 0,
      customer: this.currentCustomer ?? null,
      invoiceGross: controlNetOrGross ? 0 : this.subcontractForm.value.invoiceAmount,
      invoiceNet: controlNetOrGross ? this.subcontractForm.value.invoiceAmount : 0,
      note: '',
      projectCostCenter: null,//falta
      date: '',
    };
  }

  private getContractorById(contractorId: number): Contractor | null {
    return this.contractors.find(c => c.id === contractorId) ?? null;
  }

  private updateSubcontract(): void {
    if (this.subcontractForm.invalid) {
      console.error('Form is invalid');
      return;
    }
    this.isLoading = true;
    const subcontractUpdated = this.buildSubcontractEdited(this.subcontractToEdit);
    this.subscriptions.add(
      this.subcontractUtils.updateSubcontract(subcontractUpdated).subscribe({
        next: (response) => {
          this.isLoading = false;
          this.commonMessageService.showEditSucessfullMessage();
          this.router.navigate(['.', response.id], { relativeTo: this.route });
        },
        error: (error) => {
          this.isLoading = false;
          console.error('Error updating subcontract:', error);
          this.commonMessageService.showErrorEditMessage();
        }
      })
    );
  }

  private loadSubcontractDataForm(subcontract: Subcontract): void {
    this.subcontractForm.patchValue({
      contractTitle: subcontract.contractTitle,
      contractor: subcontract.contractor?.id,
      invoiceNumber: subcontract.invoiceNo,
      invoiceDate: subcontract.invoiceDate ? new Date(subcontract.invoiceDate) : null,
      netOrGross: subcontract.netOrGross ? 'net' : 'gross',
      invoiceAmount: subcontract.netOrGross ? subcontract.invoiceNet : subcontract.invoiceGross,
      afa: subcontract.isAfa,
      afaDurationMonths: subcontract.afamonths > 0 ? subcontract.afamonths : '',
      description: subcontract.description
    });
  }

  private buildSubcontractEdited(subcontractSource: any): Subcontract {
    return {
      id: this.subcontractId,
      createdAt: subcontractSource.createdAt ?? new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: subcontractSource?.version ?? 0,
      contractor: this.getContractorById(this.subcontractForm.value.contractor),
      customer: subcontractSource.customer ?? null,
      projectCostCenter: null, // falta
      afamonths: this.subcontractForm.value.afa ? this.subcontractForm.value.afaDurationMonths : 0,
      contractTitle: this.subcontractForm.value.contractTitle,
      date: '',
      description: this.subcontractForm.value.description,
      invoiceAmount: this.subcontractForm.value.invoiceAmount,
      invoiceDate: momentFormatDate(this.subcontractForm.value.invoiceDate),
      invoiceGross: this.subcontractForm.value.netOrGross === 'gross' ? this.subcontractForm.value.invoiceAmount : 0,
      invoiceNet: this.subcontractForm.value.netOrGross === 'net' ? this.subcontractForm.value.invoiceAmount : 0,
      invoiceNo: this.subcontractForm.value.invoiceNumber,
      isAfa: this.subcontractForm.value.afa,
      netOrGross: this.subcontractForm.value.netOrGross === 'net',
      note: '',
    }
  }

  private getCurrentCustomer(): void {
    this.subscriptions.add(
      this.customerUtils.getCustomerById(this.customerId).subscribe(customer => {
        this.currentCustomer = customer;
      })
    );
  }

  private handleCreateSuccess(response: Subcontract): void {
    this.isLoading = false;
    this.commonMessageService.showCreatedSuccesfullMessage();
    this.subcontractForm.reset();
    this.router.navigate(['.', response.id], { relativeTo: this.route });
  }

  private handleErrorCreated(error: any): void {
    this.isLoading = false;
    console.error('Error create subcontract:', error);
    this.commonMessageService.showErrorCreatedMessage();
  }

  private handleUpdateSubcontractError(err: any): void {
    if (err.message === 'Conflict detected: subcontract version mismatch') {
      this.showOCCErrorModalSubcontract = true;
    } else {
      this.commonMessageService.showErrorEditMessage();
    }
  }
}
