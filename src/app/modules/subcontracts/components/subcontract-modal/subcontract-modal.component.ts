import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { momentFormatDate } from '../../../shared/utils/moment-date-utils';
import { Contractor } from '../../../../Entities/contractor';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContractorUtils } from '../../../contractor/utils/contractor-utils';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-subcontract-modal',
  standalone: false,
  templateUrl: './subcontract-modal.component.html',
  styleUrl: './subcontract-modal.component.scss'
})
export class SubContractModalComponent implements OnInit, OnChanges {

  @Input() selectedSubContract: any
  @Input() customer: any
  @Input() modalSubcontractType: any
  @Output() deletedSubContract = new EventEmitter();
  @Output() createdSubContract = new EventEmitter();
  @Output() visibleModal = new EventEmitter();
  private readonly contractorUtils = inject(ContractorUtils);
  private readonly route = inject(ActivatedRoute);
  public createSubcontractForm!: FormGroup;
  public optionsNetOrGross!: { label: string, value: string }[];
  @ViewChild('inputText') firstInput!: ElementRef;
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
  
  constructor(private readonly translate: TranslateService) {}

  ngOnInit(): void {
    this.loadOptionsInvoiceLabel();
    this.translate.onLangChange.subscribe(() => {
      this.loadOptionsInvoiceLabel();
    });
    this.initForm();
    this.firstInputFocus();
  }

  ngOnChanges(changes: SimpleChanges): void {
    let modalTypeChanges = changes['modalSubcontractType'];
    if (modalTypeChanges && !modalTypeChanges.firstChange) {
      let modalTypeValue = modalTypeChanges.currentValue;
      if (modalTypeValue === 'create') {
        this.ngOnInit()
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
      { label: this.translate.instant('SUB-CONTRACTS.FORM.NET'), value: 'net' },
      { label: this.translate.instant('SUB-CONTRACTS.FORM.GROSS'), value: 'gross' }
    ];
  }

  private firstInputFocus(): void {
    setTimeout(()=>{
      if(this.firstInput.nativeElement){
        this.firstInput.nativeElement.focus()
      }
    },300)
  }

  onSubmit() {
    if (this.createSubcontractForm.invalid) {
      console.error('Form is invalid');
      return;
    }
    const newSubcontract = this.buildSubcontractFromForm();
    this.createdSubContract.emit(newSubcontract);
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
    this.visibleModal.emit(false);
  }

}