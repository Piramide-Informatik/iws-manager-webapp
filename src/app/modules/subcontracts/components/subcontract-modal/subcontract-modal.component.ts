import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { map } from 'rxjs';
import { momentFormatDate } from '../../../shared/utils/moment-date-utils';
import { Contractor } from '../../../../Entities/contractor';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContractorUtils } from '../../../contractor/utils/contractor-utils';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../../../Entities/customer';
import { Subcontract } from '../../../../Entities/subcontract';
import { SubcontractUtils } from '../../utils/subcontracts-utils';
import { OccError } from '../../../shared/utils/occ-error';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-subcontract-modal',
  standalone: false,
  templateUrl: './subcontract-modal.component.html',
  styleUrl: './subcontract-modal.component.scss'
})
export class SubContractModalComponent implements OnInit, OnChanges {
  private readonly contractorUtils = inject(ContractorUtils);
  private readonly subcontractsUtils = inject(SubcontractUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  @Input() selectedSubContract!: Subcontract;
  @Input() customer: Customer | undefined;
  @Input() modalSubcontractType: 'create' | 'delete' = 'create';
  @Input() isVisibleModal: boolean = false;
  @Output() deletedSubContract = new EventEmitter<{ deleted?: Subcontract, status: 'success' | 'error', error?: OccError | HttpErrorResponse }>();
  @Output() createdSubContract = new EventEmitter<{ created?: Subcontract, status: 'success' | 'error' }>();
  @Output() visibleModal = new EventEmitter();
  @ViewChild('inputText') firstInput!: ElementRef;
  
  public isLoading = false;
  public isLoadingDelete = false;
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
    if(changes['isVisibleModal'] && this.isVisibleModal){
      setTimeout(() => {
        this.firstInputFocus();
        this.createSubcontractForm.get('netOrGross')?.setValue(this.optionsNetOrGross[0].value)
      })
    }

    if (changes['isVisibleModal'] && !this.isVisibleModal && this.createSubcontractForm) {
      this.createSubcontractForm.reset();
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
      netOrGross: new FormControl(this.optionsNetOrGross[0].value), // default: 'gross'
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
    if (this.createSubcontractForm.invalid) return;

    this.isLoading = true;
    const newSubcontract = this.buildSubcontractFromForm();
    this.subcontractsUtils.createNewSubcontract(newSubcontract).subscribe({
      next: (createdSubContract) => {
        this.isLoading = false;
        this.closeModal();
        this.createdSubContract.emit({ created: createdSubContract, status: 'success' });
        setTimeout(() => {
          this.navigationToEdit(createdSubContract.id);
        }, 1000)
      },
      error: () => {
        this.isLoading = false;
        this.closeModal();
        this.createdSubContract.emit({ status: 'error' });
      }
    });
  }

  private navigationToEdit(id: number): void {
    this.router.navigate(['./subcontracts-details', id], { relativeTo: this.route });
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

  private buildSubcontractFromForm(): Omit<Subcontract, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
    // controlNetOrGross == true -> invoiceNet, false -> invoiceGross
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
      customer: this.customer ?? null,
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
    if(!this.selectedSubContract) return;

    this.isLoadingDelete = true;
    this.subcontractsUtils.deleteSubcontract(this.selectedSubContract.id).subscribe({
      next: () => {
        this.isLoadingDelete = false;
        this.deletedSubContract.emit({ deleted: this.selectedSubContract, status: 'success' });
        this.closeModal();
      },
      error: (error) => {
        this.isLoadingDelete = false;
        this.closeModal();
        this.deletedSubContract.emit({ status: 'error', error });
      }
    }); 
  }

  closeModal() {
    this.createSubcontractForm.reset();
    this.visibleModal.emit(false);
  }

}