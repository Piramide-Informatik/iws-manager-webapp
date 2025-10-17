import { Component, OnInit, inject, Output, EventEmitter, Input, OnChanges, SimpleChanges, ViewChild, ElementRef } from '@angular/core';
import { FrameworkAgreementsUtils } from '../../utils/framework-agreement.util';
import { FundingProgramUtils } from '../../../master-data/components/funding-programs/utils/funding-program-utils';
import { ContractStatusUtils } from '../../../master-data/components/contract-status/utils/contract-status-utils';
import { EmployeeIwsUtils } from '../../../master-data/components/iws-staff/utils/employee-iws-utils';
import { FormControl, FormGroup } from '@angular/forms';
import { BasicContract } from '../../../../Entities/basicContract';
import { momentFormatDate } from '../../../shared/utils/moment-date-utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { Customer } from '../../../../Entities/customer';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';
import { HttpErrorResponse } from '@angular/common/http';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-framework-agreements-modal',
  standalone: false,
  templateUrl: './framework-agreements-modal.component.html',
  styleUrl: './framework-agreements-modal.component.scss'
})
export class FrameworkAgreementsModalComponent implements OnInit, OnChanges { 
  @Input() selectedFrameworkAgreement: BasicContract | undefined;
  @Input() customer!: Customer;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() visible = false;
  @Output() visibleModal = new EventEmitter<boolean>();
  @Output() showOCCErrorModalFA = new EventEmitter<boolean>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
  private readonly contractStatusUtils = inject(ContractStatusUtils);
  private readonly employeeIwsUtils = inject(EmployeeIwsUtils);
  private readonly frameworkUtils = inject(FrameworkAgreementsUtils);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  
  public isLoading = false;
  public isLoadingDelete = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
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
  }
  
  ngOnChanges(changes: SimpleChanges): void {
    if(changes['visible'] && this.visible){
      this.getNextContractNumber();
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }

    if(changes['visible'] && !this.visible && this.basicContractCreateForm){
      this.basicContractCreateForm.reset();
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
    if (this.basicContractCreateForm.invalid || !this.customer) return
    
    this.isLoading = true;
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
    
    this.frameworkUtils.createNewFrameworkAgreement(newBasicContract).subscribe({
      next: (createdContract) => {
        this.isLoading = false;
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.visibleModal.emit(false);
        setTimeout(() => {
          this.navigationToEdit(createdContract.id);
        }, 500)
      },
      error: () => {
        this.isLoading = false;
        this.commonMessageService.showErrorCreatedMessage();
      }
    });
  }

  private navigationToEdit(id: number): void {
    this.router.navigate(['./framework-agreement-details', id], { relativeTo: this.route });
  }
  
  onFrameworkAgreementDeleteConfirm() {
    if(this.selectedFrameworkAgreement){
      this.isLoadingDelete = true;
      this.frameworkUtils.deleteFrameworkAgreement(this.selectedFrameworkAgreement.id).subscribe({
        next: () => {
          this.isLoadingDelete = false;
          this.commonMessageService.showDeleteSucessfullMessage();
          this.closeModal();
        },
        error: (error) => {
          this.isLoadingDelete = false;
          this.closeModal();
          if (error instanceof OccError || error?.message.includes('404')) {
            this.showOCCErrorModalFA.emit(true);
            this.occErrorType = 'DELETE_UNEXISTED';
            this.commonMessageService.showErrorDeleteMessage();
          } else if (error instanceof HttpErrorResponse && error.status === 500 && error.error.message.includes('foreign key constraint')){
            this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
          } else {
            this.commonMessageService.showErrorDeleteMessage();
          }
        }
      }) 
    }
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

  private getNextContractNumber(): void {
    this.frameworkUtils.getNextContractNumber().subscribe(lastContractNo => {
      if(lastContractNo){
        this.basicContractCreateForm.patchValue({
          contractNo: lastContractNo
        })
      }
    })
  }
}