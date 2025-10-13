import { Component, OnInit, inject, Output, EventEmitter, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FrameworkAgreementsUtils } from '../../utils/framework-agreement.util';
import { FundingProgramUtils } from '../../../master-data/components/funding-programs/utils/funding-program-utils';
import { ContractStatusUtils } from '../../../master-data/components/contract-status/utils/contract-status-utils';
import { EmployeeIwsUtils } from '../../../master-data/components/iws-staff/utils/employee-iws-utils';
import { FormControl, FormGroup } from '@angular/forms';
import { BasicContract } from '../../../../Entities/basicContract';
import { momentFormatDate } from '../../../shared/utils/moment-date-utils';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-framework-agreements-modal',
  standalone: false,
  templateUrl: './framework-agreements-modal.component.html',
  styleUrl: './framework-agreements-modal.component.scss'
})
export class FrameworkAgreementsModalComponent implements OnInit, OnChanges {  
  @Input() selectedFrameworkAgreement: any
  @Input() customer: any
  @Input() modalType: any
  @Input() isLoading = false;
  @Input() visible = false;
  @Output() deletedFrameworkAgreement = new EventEmitter();
  @Output() createdFrameworkAgreement = new EventEmitter();
  @Output() visibleModal = new EventEmitter();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
  private readonly contractStatusUtils = inject(ContractStatusUtils);
  private readonly employeeIwsUtils = inject(EmployeeIwsUtils);
  private readonly frameworkUtils = inject(FrameworkAgreementsUtils);
  
  public basicContractCreateForm!: FormGroup;
  public readonly fundingPrograms = toSignal(
    this.fundingProgramUtils.getAllFundingPrograms(), { initialValue: [] }
  );
  public readonly contractStatus = toSignal(
    this.contractStatusUtils.getAllcontractStatuses(), { initialValue: [] }
  );
  public readonly employeeIws = toSignal(
    this.employeeIwsUtils.getAllEmployeeIws(), { initialValue: [] }
  );
  
  ngOnInit(): void {
    this.initOrderForm();
    this.frameworkUtils.getNextContractNumber().subscribe(lastContractNo => {
      if(lastContractNo){
        this.basicContractCreateForm.patchValue({
          contractNo: lastContractNo
        })
      }
    })
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    let modalTypeChanges = changes['modalType'];
    if (modalTypeChanges && !modalTypeChanges.firstChange) {
      let modalTypeValue = modalTypeChanges.currentValue;
      if (modalTypeValue === 'create') {
        this.ngOnInit()
      }
    }

    if(changes['visible'] && this.visible){
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
  }
  
  get isCreateFrameworkAgreementMode() {
    return this.modalType === 'create'
  }
  
  private initOrderForm(): void {
    this.basicContractCreateForm = new FormGroup({
      contractNo: new FormControl(null),
      contractLabel: new FormControl(''),
      date: new FormControl(''),
      contractTitle: new FormControl(''),
      confirmationDate: new FormControl(''),
      fundingProgram: new FormControl(''),
      contractStatus: new FormControl(''),
      employeeIws: new FormControl(''),
    });
    this.basicContractCreateForm.get('contractNo')?.disable();
  }
  
  onSubmit() {
    if (this.basicContractCreateForm.invalid) return
    
    if (this.customer) {
      const newBasicContract: Omit<BasicContract, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
        contractNo: this.basicContractCreateForm.getRawValue().contractNo,
        contractLabel: this.basicContractCreateForm.value.contractLabel,
        date: momentFormatDate(this.basicContractCreateForm.value.date),
        contractTitle: this.basicContractCreateForm.value.contractTitle,
        confirmationDate: this.basicContractCreateForm.value.confirmationDate,
        fundingProgram: this.findById(this.fundingPrograms(), this.basicContractCreateForm.value.fundingProgram ?? 0),
        contractStatus: this.findById(this.contractStatus(), this.basicContractCreateForm.value.contractStatus ?? 0),
        employeeIws: this.findById(this.employeeIws(), this.basicContractCreateForm.value.employeeIws),
        customer: this.customer
      }
      this.createdFrameworkAgreement.emit(newBasicContract);
    }
  }
  
  onFrameworkAgreementDeleteConfirm() {
    this.deletedFrameworkAgreement.emit(this.selectedFrameworkAgreement);  
  }
  
  closeModal() {
    this.visibleModal.emit(false);
    this.basicContractCreateForm.reset();
  }
  
  private findById<T extends { id: number }>(items: T[], id: number): T | null {
    return id === 0 ? null : items.find(item => item.id === id) ?? null;
  }

  private focusInputIfNeeded(): void {
    if (this.isCreateFrameworkAgreementMode && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}