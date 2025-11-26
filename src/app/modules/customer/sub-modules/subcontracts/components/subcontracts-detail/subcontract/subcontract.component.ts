import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { map, Subscription } from 'rxjs';
import { Subcontract } from '../../../../../../../Entities/subcontract';
import { SubcontractUtils } from '../../../utils/subcontracts-utils';
import { CommonMessagesService } from '../../../../../../../Services/common-messages.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContractorUtils } from '../../../../contractor/utils/contractor-utils';
import { ActivatedRoute, Router } from '@angular/router';
import { Contractor } from '../../../../../../../Entities/contractor';
import { momentFormatDate } from '../../../../../../shared/utils/moment-date-utils';
import { Customer } from '../../../../../../../Entities/customer';
import { CustomerUtils } from '../../../../../../customer/utils/customer-utils';
import { SubcontractStateService } from '../../../utils/subcontract-state.service';
import { OccError, OccErrorType } from '../../../../../../shared/utils/occ-error';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-subcontract',
  standalone: false,
  templateUrl: './subcontract.component.html',
  styleUrls: ['./subcontract.component.scss'],
})
export class SubcontractComponent implements OnInit, OnDestroy, OnChanges {
  private readonly subcontractUtils = inject(SubcontractUtils);
  private readonly subcontractStateService = inject(SubcontractStateService);
  private readonly contractorUtils = inject(ContractorUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly translate = inject(TranslateService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly subscriptions = new Subscription();
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly titleService = inject(Title);
  private langSubscription!: Subscription;
  public subcontractForm!: FormGroup;
  public showOCCErrorModalSubcontract = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public redirectRoute = "";
  public optionsNetOrGross!: { label: string, value: string }[];
  @ViewChild('inputText') firstInput!: ElementRef;
  isLoading = false;
  @Output() public onLoadingUpdate = new EventEmitter<boolean>();
  @Output() formDirty = new EventEmitter<boolean>();
  @Output() formInvalid = new EventEmitter<boolean>();
  mode: 'create' | 'edit' = 'create';
  @Input() subcontractToEdit!: Subcontract | null;
  private readonly customerId: number = this.route.snapshot.params['id'];
  private contractors: Contractor[] = [];
  public contractorsName = toSignal(
    this.contractorUtils.getAllContractorsByCustomerId(this.customerId).pipe(
      map(contractors => {
        this.contractors = contractors;
        return contractors.map(c => ({ id: c.id, name: c.name }));
      })
    )
  );
  private previousDirtyState = false;
  private previousInvalidState = false;

  public currentCustomer!: Customer | undefined;

  ngOnInit(): void {
    this.loadOptionsInvoiceLabel();
    this.updateTitle();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadOptionsInvoiceLabel();
      this.updateTitle();
    });

    this.initForm();
    this.checkboxAfaChange();
    this.firstInputFocus();
    this.subcontractForm.valueChanges.subscribe(() => {
      this.checkDirtyState();
      this.checkInvalidState();
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['subcontractToEdit'] && this.subcontractToEdit) {
      this.mode = 'edit';
      this.loadSubcontractDataForm(this.subcontractToEdit);
    } else {
      this.mode = 'create';
      this.getCurrentCustomer();
    }
  }

  ngOnDestroy(): void {
    if (this.subscriptions) {
      this.subscriptions.unsubscribe();
    }
  }

  private checkDirtyState(): void {
    const currentDirty = this.subcontractForm.dirty;
    
    if (currentDirty !== this.previousDirtyState) {
      this.previousDirtyState = currentDirty;
      this.formDirty.emit(currentDirty);
    }
  }

  private checkInvalidState(): void {
    const currentIvalid = this.subcontractForm.invalid;

    if(currentIvalid !== this.previousInvalidState){
      this.previousInvalidState = currentIvalid;
      this.formInvalid.emit(currentIvalid);
    }
  }

  private initForm(): void {
    this.subcontractForm = new FormGroup({
      contractTitle: new FormControl(''),
      contractor: new FormControl(''),
      invoiceNumber: new FormControl(''),
      invoiceDate: new FormControl(''),
      netOrGross: new FormControl(''),
      invoiceAmount: new FormControl('', [Validators.max(99999999.99)]),
      afa: new FormControl(false), // checkbox
      afaDurationMonths: new FormControl({ value: null, disabled: true }, [Validators.max(999)]), // solo si afa = true
      description: new FormControl(''),
    });
    this.subcontractForm.reset();
  }

  private checkboxAfaChange(): void {
    this.subcontractForm.get('afa')?.valueChanges.subscribe((value: boolean) => {
      const afaDurationControl = this.subcontractForm.get('afaDurationMonths');
      if (value) {
        afaDurationControl?.enable();
      } else {
        afaDurationControl?.disable();
        afaDurationControl?.setValue(null, { emitEvent: false });
      }
    });
  }

  private loadOptionsInvoiceLabel(): void {
    this.optionsNetOrGross = [
      { label: this.translate.instant('SUB-CONTRACTS.FORM.GROSS'), value: 'gross' },
      { label: this.translate.instant('SUB-CONTRACTS.FORM.NET'), value: 'net' }
    ];
  }

  onSubmit(): void {
    if (this.mode === 'edit') {
      this.updateSubcontract();
    }
  }

  private getContractorById(contractorId: number): Contractor | null {
    return this.contractors.find(c => c.id === contractorId) ?? null;
  }

  private updateSubcontract(): void {
    if (this.subcontractForm.invalid) return;

    this.isLoading = true;
    this.onLoadingUpdate.emit(this.isLoading);
    const subcontractUpdated = this.buildSubcontractEdited(this.subcontractToEdit);

    if (subcontractUpdated.netOrGross === this.subcontractToEdit?.netOrGross && 
      subcontractUpdated.invoiceAmount === this.subcontractToEdit?.invoiceAmount) {
      this.updateOnlySubcontract(subcontractUpdated);
    } else {
      this.updateSubcontractWithProjects(subcontractUpdated);
    }
  }

  private updateOnlySubcontract(subcontractUpdated: Subcontract): void {
    this.subscriptions.add(
      this.subcontractUtils.updateSubcontract(subcontractUpdated).subscribe({
        next: (updated: Subcontract) => this.handleUpdateSubcontractSuccess(updated),
        error: (error) => this.handleUpdateSubcontractError(error)
      })
    );
  }

  private updateSubcontractWithProjects(subcontractUpdated: Subcontract): void {
    this.subscriptions.add(
      this.subcontractUtils.updateSubcontractWithSubcontractProjects(subcontractUpdated).subscribe({
        next: (updated: Subcontract) => this.handleUpdateSubcontractSuccess(updated),
        error: (error) => this.handleUpdateSubcontractError(error)
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
    // controlNetOrGross == true -> invoiceNet, false -> invoiceGross
    const controlNetOrGross: boolean = this.subcontractForm.value.netOrGross === 'net';
    return {
      id: subcontractSource.id,
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
      invoiceGross: controlNetOrGross ? 0 : this.subcontractForm.value.invoiceAmount,
      invoiceNet: controlNetOrGross ? this.subcontractForm.value.invoiceAmount : 0,
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

  private updateTitle(): void {
    this.titleService.setTitle(this.translate.instant('PAGETITLE.CUSTOMERS.SUBCONTRACTS'));
  }

  private handleUpdateSubcontractError(error: Error): void {
    this.isLoading = false;
    this.onLoadingUpdate.emit(this.isLoading);
    this.commonMessageService.showErrorEditMessage();
    if (error instanceof OccError) {
      this.showOCCErrorModalSubcontract = true;
      this.occErrorType = error.errorType;
      if (this.occErrorType === 'UPDATE_UNEXISTED') {
        this.redirectRoute = "/customers/subcontracts/" + this.currentCustomer?.id;
      }
    }
  }

  private handleUpdateSubcontractSuccess(updated: Subcontract): void {
    this.isLoading = false;
    this.onLoadingUpdate.emit(this.isLoading);
    this.subcontractStateService.notifySubcontractUpdate(updated);
    this.commonMessageService.showEditSucessfullMessage();
    this.subcontractToEdit = updated;
    this.loadSubcontractDataForm(updated);
  }

  private firstInputFocus(): void {
    setTimeout(() => {
      if (this.firstInput.nativeElement) {
        this.firstInput.nativeElement.focus()
      }
    }, 300)
  }
}
