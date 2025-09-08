import { Component, OnInit, inject, Output, EventEmitter, Input, OnChanges, SimpleChanges } from '@angular/core';
import { FrameworkAgreementsUtils } from '../../utils/framework-agreement.util';
import { FundingProgramUtils } from '../../../master-data/components/funding-programs/utils/funding-program-utils';
import { ContractStatusUtils } from '../../../master-data/components/contract-status/utils/contract-status-utils';
import { EmployeeIwsUtils } from '../../../master-data/components/iws-staff/utils/employee-iws-utils';
import { FormControl, FormGroup } from '@angular/forms';
import { BasicContract } from '../../../../Entities/basicContract';
import { momentFormatDate } from '../../../shared/utils/moment-date-utils';
import { FundingProgram } from '../../../../Entities/fundingProgram';
import { ContractStatus } from '../../../../Entities/contractStatus';
import { EmployeeIws } from '../../../../Entities/employeeIws';
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
  @Output() deletedFrameworkAgreement = new EventEmitter();
  @Output() createdFrameworkAgreement = new EventEmitter();
  @Output() visibleModal = new EventEmitter();
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
        fundingProgram: this.getFundingProgram(this.basicContractCreateForm.value.fundingProgram ?? 0),
        contractStatus: this.getContractStatus(this.basicContractCreateForm.value.contractStatus ?? 0),
        employeeIws: this.getEmployeeIws(this.basicContractCreateForm.value.employeeIws),
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
  }

  private getFundingProgram(idFunding: number): FundingProgram | null {
    return idFunding === 0? null : this.fundingPrograms().find( f => f.id === idFunding) ?? null;
  }

  private getContractStatus(idContractStatus: number): ContractStatus | null {
    return idContractStatus === 0? null : this.contractStatus().find( c => c.id === idContractStatus) ?? null;
  }

  private getEmployeeIws(idEmployeeIws: number): EmployeeIws | null {
    return idEmployeeIws === 0? null : this.employeeIws().find( e => e.id === idEmployeeIws) ?? null;
  }
}