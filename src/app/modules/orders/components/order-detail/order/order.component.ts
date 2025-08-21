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
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-order',
  standalone: false,
  templateUrl: './order.component.html',
  styleUrl: './order.component.scss'
})
export class OrderComponent implements OnInit, OnDestroy, OnChanges {
  private readonly fundingProgramUtils = inject(FundingProgramUtils);
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
        orderType: this.orderToEdit.orderType?.costtype,
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
      basiccontract: null,
      contractor: null,
      contractStatus: null,
      customer: this.currentCustomer,
      employeeIws: null,
      fundingProgram: this.getFundingProgram(this.orderForm.value.fundingProgram ?? 0),
      orderType: null,
      project: null, //get other component
      promoter: null,//get de project
      acronym: this.orderForm.value.acronym ?? '',
      approvalDate: momentFormatDate(this.orderForm.value.approvalDate) ?? '',
      approvalPdf: '', 
      contractData1: '',
      contractData2: '',
      contractPdf: '', 
      fixCommission: 0, //otro
      iwsProvision: 0, //otro
      maxCommission: 0, //otro
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
