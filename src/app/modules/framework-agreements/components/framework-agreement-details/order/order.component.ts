import { Component, ElementRef, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FundingProgramUtils } from '../../../../master-data/components/funding-programs/utils/funding-program-utils';
import { ContractStatusUtils } from '../../../../master-data/components/contract-status/utils/contract-status-utils';
import { EmployeeIwsUtils } from '../../../../master-data/components/iws-staff/utils/employee-iws-utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { BasicContract } from '../../../../../Entities/basicContract';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '../../../../../Entities/customer';
import { Subscription } from 'rxjs';
import { CustomerUtils } from '../../../../customer/utils/customer-utils';
import { momentCreateDate, momentFormatDate } from '../../../../shared/utils/moment-date-utils';
import { FundingProgram } from '../../../../../Entities/fundingProgram';
import { ContractStatus } from '../../../../../Entities/contractStatus';
import { EmployeeIws } from '../../../../../Entities/employeeIws';
import { FrameworkAgreementsUtils } from '../../../utils/framework-agreement.util';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../shared/utils/occ-error';
import { Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

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
  private readonly titleService = inject(Title);
  private readonly translate = inject(TranslateService);

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
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public redirectRoute = "";
  @ViewChild('inputText') firstInput!: ElementRef;
  public basicContractForm!: FormGroup;

  ngOnInit(): void {
    this.initOrderForm();
    this.getCurrentCustomer();
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(
      `${this.translate.instant('PAGETITLE.CUSTOMER')} ${name} ${this.translate.instant('PAGETITLE.CUSTOMERS.BASIC_CONTRACTS')}`
    );
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contractToEdit'] && this.contractToEdit && this.basicContractForm) {
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
      this.firstInputFocus();
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
    if (this.basicContractForm.invalid || !this.contractToEdit) return

    this.updateFrameworkAgreement();
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
        this.commonMessageService.showErrorEditMessage();
        this.handleSaveError(error);
      }
    });
  }

  private handleSaveError(error: any): void {
    if (error instanceof OccError) {
      this.showOCCErrorModalBasicContract = true;
      this.occErrorType = error.errorType;
      this.redirectRoute = "/customers/framework-agreements/" + this.currentCustomer.id;
    }
  }

  private getFundingProgram(idFunding: number): FundingProgram | null {
    return idFunding === 0 ? null : this.fundingPrograms().find(f => f.id === idFunding) ?? null;
  }

  private getContractStatus(idContractStatus: number): ContractStatus | null {
    return idContractStatus === 0 ? null : this.contractStatus().find(c => c.id === idContractStatus) ?? null;
  }

  private getEmployeeIws(idEmployeeIws: number): EmployeeIws | null {
    return idEmployeeIws === 0 ? null : this.employeeIws().find(e => e.id === idEmployeeIws) ?? null;
  }

  private getCurrentCustomer(): void {
    this.subscriptions.add(
      this.customerUtils.getCustomerById(this.customerId).subscribe(customer => {
        if (customer) {
          this.currentCustomer = customer;
          this.updateTitle(this.currentCustomer.customername1!)
        }
      })
    );
  }

  private firstInputFocus(): void {
    setTimeout(() => {
      if (this.firstInput.nativeElement) {
        this.firstInput.nativeElement.focus();
      }
    }, 300)
  }
}
