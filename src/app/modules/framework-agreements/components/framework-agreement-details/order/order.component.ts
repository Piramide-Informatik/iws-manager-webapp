import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FundingProgramUtils } from '../../../../master-data/components/funding-programs/utils/funding-program-utils';
import { ContractStatusUtils } from '../../../../master-data/components/contract-status/utils/contract-status-utils';
import { EmployeeIwsUtils } from '../../../../master-data/components/iws-staff/utils/employee-iws-utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { BasicContract } from '../../../../../Entities/basicContract';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../../../../Entities/customer';
import { Subscription } from 'rxjs';
import { CustomerUtils } from '../../../../customer/utils/customer-utils';
import { momentCreateDate, momentFormatDate } from '../../../../shared/utils/moment-date-utils';
import { FundingProgram } from '../../../../../Entities/fundingProgram';
import { ContractStatus } from '../../../../../Entities/contractStatus';
import { EmployeeIws } from '../../../../../Entities/employeeIws';
import { FrameworkAgreementsUtils } from '../../../utils/framework-agreement.util';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, OnChanges {
  private readonly frameworkUtils = inject(FrameworkAgreementsUtils);
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
  private readonly contractStatusUtils = inject(ContractStatusUtils);
  private readonly employeeIwsUtils = inject(EmployeeIwsUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly subscriptions = new Subscription();
  private readonly customerUtils = inject(CustomerUtils);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly router = inject(Router);

  public readonly fundingPrograms = toSignal(
    this.fundingProgramUtils.getAllFundingPrograms(), { initialValue: [] }
  );

  public readonly contractStatus = toSignal(
    this.contractStatusUtils.getAllcontractStatuses(), { initialValue: [] }
  );

  public readonly employeeIws = toSignal(
    this.employeeIwsUtils.getAllEmployeeIws(), { initialValue: [] }
  );

  private readonly customerId: number = this.route.snapshot.params['id'];
  private currentCustomer!: Customer;
  @Input() contractToEdit!: BasicContract;
  @Output() onIsLoading = new EventEmitter<boolean>();
  public showOCCErrorModalBasicContract: boolean = false;

  public basicContractForm!: FormGroup;

  ngOnInit(): void {
    this.getCurrentCustomer();
    this.initOrderForm();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['contractToEdit'] && this.contractToEdit){
      this.basicContractForm.patchValue({
        contractNo: this.contractToEdit.contractNo,
        contractLabel: this.contractToEdit.contractLabel,
        date: momentCreateDate(this.contractToEdit.date),
        contractTitle: this.contractToEdit.contractTitle,
        confirmationDate: momentCreateDate(this.contractToEdit.confirmationDate),
        fundingProgram: this.contractToEdit.fundingProgram?.id,
        contractStatus: this.contractToEdit.contractStatus?.id,
        employeeIws: this.contractToEdit.employeeIws?.id
      });
    }
  }

  private initOrderForm(): void {
    this.basicContractForm = new FormGroup({
      contractNo: new FormControl(null),
      contractLabel: new FormControl(''),
      date: new FormControl(''),
      contractTitle: new FormControl(''),
      confirmationDate: new FormControl(''),
      fundingProgram: new FormControl(''),
      contractStatus: new FormControl(''),
      employeeIws: new FormControl(''),
    });
    this.basicContractForm.get('contractNo')?.disable();
  }

  onSubmit(): void {
    if (this.basicContractForm.invalid) return

    if (this.contractToEdit) {
      this.updateFrameworkAgreement();
    } else {
      this.createFrameworkAgreement();
    }
  }

  private updateFrameworkAgreement(): void {
    this.onIsLoading.emit(true);

    const updateContract: BasicContract = {
      ...this.contractToEdit,
      contractNo: this.basicContractForm.getRawValue().contractNo,
      contractLabel: this.basicContractForm.value.contractLabel,
      date: momentFormatDate(this.basicContractForm.value.date),
      contractTitle: this.basicContractForm.value.contractTitle,
      confirmationDate: this.basicContractForm.value.confirmationDate,
      fundingProgram: this.getFundingProgram(this.basicContractForm.value.fundingProgram ?? 0),
      contractStatus: this.getContractStatus(this.basicContractForm.value.contractStatus ?? 0),
      employeeIws: this.getEmployeeIws(this.basicContractForm.value.employeeIws)
    }

    this.frameworkUtils.updateFrameworkAgreements(updateContract).subscribe({
      next: (updatedContract) => {
        this.onIsLoading.emit(false);
        this.commonMessageService.showEditSucessfullMessage();
        this.contractToEdit = updatedContract;
      },
      error: (error) => {
        this.onIsLoading.emit(false);
        console.log(error);
        if(error.message === 'Conflict detected: framework agreement version mismatch'){
          this.showOCCErrorModalBasicContract = true;
        }else{
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  private createFrameworkAgreement(): void {
    this.onIsLoading.emit(true);

    const newBasicContract: Omit<BasicContract, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      contractNo: this.basicContractForm.getRawValue().contractNo,
      contractLabel: this.basicContractForm.value.contractLabel,
      date: momentFormatDate(this.basicContractForm.value.date),
      contractTitle: this.basicContractForm.value.contractTitle,
      confirmationDate: this.basicContractForm.value.confirmationDate,
      fundingProgram: this.getFundingProgram(this.basicContractForm.value.fundingProgram ?? 0),
      contractStatus: this.getContractStatus(this.basicContractForm.value.contractStatus ?? 0),
      employeeIws: this.getEmployeeIws(this.basicContractForm.value.employeeIws),
      customer: this.currentCustomer
    }
    
    this.frameworkUtils.createNewFrameworkAgreement(newBasicContract).subscribe({
      next: (createdContract) => {
        this.onIsLoading.emit(false);
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.basicContractForm.reset();
        setTimeout(()=>{
          this.navigationToEdit(createdContract.id);
        },2000)
      },
      error: (error) => {
        this.onIsLoading.emit(false);
        console.log(error);
        this.commonMessageService.showErrorCreatedMessage();
      }
    });
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
  
  private getCurrentCustomer(): void {
    this.subscriptions.add(
      this.customerUtils.getCustomerById(this.customerId).subscribe(customer => {
        if(customer){
          this.currentCustomer = customer;
        }
      })
    );
  }

  private navigationToEdit(id: number): void {
    this.router.navigate(['.', id], { relativeTo: this.route });
  }
}
