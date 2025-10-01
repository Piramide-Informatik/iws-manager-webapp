import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { momentFormatDate } from '../../../shared/utils/moment-date-utils';
import { Contractor } from '../../../../Entities/contractor';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContractorUtils } from '../../../contractor/utils/contractor-utils';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '../../../../Entities/customer';
import { Subcontract } from '../../../../Entities/subcontract';

@Component({
  selector: 'app-subcontract-modal',
  standalone: false,
  templateUrl: './subcontract-modal.component.html',
  styleUrl: './subcontract-modal.component.scss'
})
export class SubContractModalComponent implements OnInit, OnChanges {
  private readonly contractorUtils = inject(ContractorUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);

  @Input() selectedSubContract!: Subcontract;
  @Input() customer: Customer | undefined;
  @Input() modalSubcontractType: 'create' | 'delete' = 'create';
  @Input() isVisibleModal: boolean = false;
  @Output() deletedSubContract = new EventEmitter();
  @Output() createdSubContract = new EventEmitter();
  @Output() visibleModal = new EventEmitter();
  @ViewChild('inputText') firstInput!: ElementRef;

  public createSubcontractForm!: FormGroup;
  public optionsNetOrGross!: { label: string, value: string }[];
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

  ngOnInit(): void {
    this.loadOptionsInvoiceLabel();
    this.translate.onLangChange.subscribe(() => {
      this.loadOptionsInvoiceLabel();
    });
    this.initForm();
    this.checkboxAfaChange();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['isVisibleModal'] && this.isVisibleModal && this.modalSubcontractType !== 'delete'){
      this.firstInputFocus();
    }

    let modalVisibleChange = changes['isVisibleModal'];
    if (modalVisibleChange && !modalVisibleChange.firstChange) {
      if (this.isVisibleModal && this.modalSubcontractType === 'create') {
        this.createSubcontractForm.reset();
      }
    }
  }

  get isCreateSubcontractMode() {
    return this.modalSubcontractType === 'create'
  }

  private initForm(): void {
    this.createSubcontractForm = new FormGroup({
      contractTitle: new FormControl(''),
      contractor: new FormControl(''),
      invoiceNumber: new FormControl(''),
      invoiceDate: new FormControl(''),
      netOrGross: new FormControl(this.optionsNetOrGross[0].value), // default: 'net'
      invoiceAmount: new FormControl(''),
      afa: new FormControl(false), // checkbox
      afaDurationMonths: new FormControl({ value: null, disabled: true }), // solo si afa = true
      description: new FormControl(''),
    });
    this.createSubcontractForm.reset();
  }

  private loadOptionsInvoiceLabel(): void {
    this.optionsNetOrGross = [
      { label: this.translate.instant('SUB-CONTRACTS.FORM.GROSS'), value: 'gross' },
      { label: this.translate.instant('SUB-CONTRACTS.FORM.NET'), value: 'net' }
    ];
  }

  private firstInputFocus(): void {
    if(this.firstInput && this.isCreateSubcontractMode){
      setTimeout(()=>{
        if(this.firstInput.nativeElement){
          this.firstInput.nativeElement.focus()
        }
      },300)
    }
  }

  onSubmit() {
    if (this.createSubcontractForm.invalid) {
      console.error('Form is invalid');
      return;
    }
    const newSubcontract = this.buildSubcontractFromForm();
    this.createdSubContract.emit(newSubcontract);
  }

  private checkboxAfaChange(): void {
    this.createSubcontractForm.get('afa')?.valueChanges.subscribe((value: boolean) => {
      const afaDurationControl = this.createSubcontractForm.get('afaDurationMonths');
      if (value) {
        afaDurationControl?.enable();
      } else {
        afaDurationControl?.disable();
        afaDurationControl?.setValue(null, { emitEvent: false });
      }
    });
  }

  private buildSubcontractFromForm() {
    const controlNetOrGross: boolean =  this.createSubcontractForm.value.netOrGross === 'net';
    return {
      contractTitle: this.createSubcontractForm.value.contractTitle,
      contractor: this.createSubcontractForm.value.contractor ? this.getContractorById(this.createSubcontractForm.value.contractor) : null,
      invoiceNo: this.createSubcontractForm.value.invoiceNumber,
      invoiceDate: momentFormatDate(this.createSubcontractForm.value.invoiceDate),
      netOrGross: controlNetOrGross,
      invoiceAmount: this.createSubcontractForm.value.invoiceAmount,
      isAfa: this.createSubcontractForm.value.afa,
      afamonths: this.createSubcontractForm.value.afa ? this.createSubcontractForm.value.afaDurationMonths : 0,
      description: this.createSubcontractForm.value.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      version: 0,
      customer: this.customer,
      invoiceGross: controlNetOrGross ? 0 : this.createSubcontractForm.value.invoiceAmount,
      invoiceNet: controlNetOrGross ? this.createSubcontractForm.value.invoiceAmount : 0,
      note: '',
      projectCostCenter: null,//falta
      date: '',
    };
  }

  private getContractorById(contractorId: number): Contractor | null {
    return this.contractors.find(c => c.id === contractorId) ?? null;
  }

  onSubcontractDeleteConfirm() {
    this.deletedSubContract.emit(this.selectedSubContract);  
  }

  closeModal() {
    this.createSubcontractForm.reset();
    this.visibleModal.emit(false);
  }

}