import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { FundingProgramUtils } from '../../../../master-data/components/funding-programs/utils/funding-program-utils';
import { toSignal } from '@angular/core/rxjs-interop';
import { Order } from '../../../../../Entities/order';
import { momentCreateDate, momentFormatDate } from '../../../../shared/utils/moment-date-utils';
import { FundingProgram } from '../../../../../Entities/fundingProgram';
import { ActivatedRoute } from '@angular/router';
import { Customer } from '../../../../../Entities/customer';
import { CustomerUtils } from '../../../../customer/utils/customer-utils';
import { map, Subscription } from 'rxjs';
import { CostTypeUtils } from '../../../../master-data/components/cost/utils/cost-type-utils';
import { CostType } from '../../../../../Entities/costType';
import { FrameworkAgreementsUtils } from '../../../../framework-agreements/utils/framework-agreement.util';
import { BasicContract } from '../../../../../Entities/basicContract';
import { ContractStatusUtils } from '../../../../master-data/components/contract-status/utils/contract-status-utils';
import { ContractStatus } from '../../../../../Entities/contractStatus';
import { EmployeeIwsUtils } from '../../../../master-data/components/iws-staff/utils/employee-iws-utils';
import { EmployeeIws } from '../../../../../Entities/employeeIws';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, OnDestroy, OnChanges {
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
  private readonly orderTypeUtils = inject(CostTypeUtils);
  private readonly contractStatusUtils = inject(ContractStatusUtils);
  private readonly framworkUtils = inject(FrameworkAgreementsUtils);
  private readonly employeeIwsUtils = inject(EmployeeIwsUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly subscriptions = new Subscription();
  @Input() orderToEdit!: Order;
  @Output() onCreateOrder = new EventEmitter<Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'version'>>();
  orderForm!: FormGroup;

  private readonly customerId: number = this.route.snapshot.params['id'];
  private currentCustomer!: Customer;
  
  public readonly fundingPrograms = toSignal(
    this.fundingProgramUtils.getAllFundingPrograms(), { initialValue: [] }
  );

  public readonly orderTypes = toSignal(
    this.orderTypeUtils.getAllCostTypes(), { initialValue: [] }
  );

  private basicContracts!: BasicContract[];
  public readonly basicContractsSelect = toSignal(
    this.framworkUtils.getAllFrameworkAgreementsByCustomerId(this.customerId).pipe(
      map(contracts => {
        this.basicContracts = contracts;
        
        return contracts.map(contract => ({
          id: contract.id,
          label: contract.contractNo + ' ' + contract.contractTitle,
        }));
      })
    ), { initialValue: [] }
  );

  private employeeIws!: EmployeeIws[];
  public readonly employeeIwsSelect = toSignal(
    this.employeeIwsUtils.getAllEmployeeIwsSortedByFirstName().pipe(
      map(employees => {
        this.employeeIws = employees;

        return employees.map(employee => ({
          id: employee.id,
          fullname: employee.firstname + ' ' + employee.lastname
        }));
      })
    ), { initialValue: [] }
  );

  public readonly contractStatus = toSignal(
    this.contractStatusUtils.getAllcontractStatuses(), { initialValue: [] }
  );

  ngOnInit(): void {
    this.getCurrentCustomer();
    this.orderForm = new FormGroup({
      orderNo: new FormControl(null),
      orderLabel: new FormControl(''),
      orderType: new FormControl(''),
      acronym: new FormControl(''),
      orderTitle: new FormControl(''),
      orderDate: new FormControl(''),
      fundingProgram: new FormControl(''),
      contractStatus: new FormControl(''),
      approvalDate: new FormControl(''),
      basicContract: new FormControl(''),
      employeeIws: new FormControl(''),
      orderValue: new FormControl(null),
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['orderToEdit'] && this.orderToEdit){
      this.orderForm.patchValue({
        orderNo: this.orderToEdit.orderNo,
        orderLabel: this.orderToEdit.orderLabel,
        orderType: this.orderToEdit.orderType?.id,
        acronym: this.orderToEdit.acronym,
        orderTitle: this.orderToEdit.orderTitle,
        orderDate: momentCreateDate(this.orderToEdit.orderDate),
        fundingProgram: this.orderToEdit.fundingProgram?.id,
        contractStatus: this.orderToEdit.contractStatus?.id,
        approvalDate: momentCreateDate(this.orderToEdit.approvalDate),
        basicContract: this.orderToEdit.basiccontract?.id,
        employeeIws: this.orderToEdit.employeeIws?.id,
        orderValue: this.orderToEdit.orderValue
      });
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.orderForm.invalid) return

    const newOrderIncomplete: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      approvalStatus: null,
      basiccontract: this.getBasicContract(this.orderForm.value.basicContract ?? 0),
      contractor: null,
      contractStatus: this.getContractStatus(this.orderForm.value.contractStatus ?? 0),
      customer: this.currentCustomer,
      employeeIws: this.getEmployeeIws(this.orderForm.value.employeeIws ?? 0),
      fundingProgram: this.getFundingProgram(this.orderForm.value.fundingProgram ?? 0),
      orderType: this.getOrderType(this.orderForm.value.orderType ?? 0),
      project: null, //get other component
      promoter: null,//get of project
      acronym: this.orderForm.value.acronym ?? '',
      approvalDate: momentFormatDate(this.orderForm.value.approvalDate) ?? '',
      approvalPdf: '', 
      contractData1: '',
      contractData2: '',
      contractPdf: '', 
      fixCommission: 0, //other component
      iwsProvision: 0, //other component
      maxCommission: 0, //other component
      nextDeptDate: '',
      noOfDepts: 0,
      orderDate: momentFormatDate(this.orderForm.value.orderDate) ?? '', 
      orderLabel: this.orderForm.value.orderLabel ?? '',
      orderNo: this.orderForm.value.orderNo, 
      orderTitle: this.orderForm.value.orderTitle ?? '', 
      orderValue: this.orderForm.value.orderValue ?? 0,
      signatureDate: ''
    }

    this.onCreateOrder.emit(newOrderIncomplete);
  }

  private getFundingProgram(idFunding: number): FundingProgram | null {
    return this.fundingPrograms().find( f => f.id === idFunding) ?? null;
  }

  private getOrderType(idOrderType: number): CostType | null {
    return this.orderTypes().find( o => o.id === idOrderType) ?? null;
  }

  private getBasicContract(idBasicContract: number): BasicContract | null {
    return this.basicContracts.find( b => b.id === idBasicContract) ?? null;
  }

  private getContractStatus(idContractStatus: number): ContractStatus | null {
    return this.contractStatus().find( c => c.id === idContractStatus) ?? null;
  }

  private getEmployeeIws(idEmployeeIws: number): EmployeeIws | null {
    return this.employeeIws.find( e => e.id === idEmployeeIws) ?? null;
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

  public clearOrderForm(): void {
    this.orderForm.reset();
  }
}
