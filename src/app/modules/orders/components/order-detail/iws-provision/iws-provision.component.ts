import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderCommission } from '../../../../../Entities/orderCommission';
import { Table } from 'primeng/table';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Order } from '../../../../../Entities/order';
import { InputNumber } from 'primeng/inputnumber';
import { OrderCommissionUtils } from '../../../utils/order-commission-utils';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { Column } from '../../../../../Entities/column';

interface OrderCommissionForm {
  fixCommission: number;
  maxCommission: number;
  iwsProvision: number;
}

@Component({
  selector: 'app-iws-provision',
  standalone: false,
  templateUrl: './iws-provision.component.html',
  styleUrl: './iws-provision.component.scss'
})
export class IwsProvisionComponent implements OnInit, OnDestroy, OnChanges {
  private readonly orderCommissionUtils = inject(OrderCommissionUtils);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly commonMessageService = inject(CommonMessagesService);
  private readonly translate = inject(TranslateService);
  private readonly subscriptions = new Subscription();

  // Order 
  orderCommissionForm!: OrderCommissionForm;
  @Input() orderToEdit!: Order;
  @Output() onCreateOrderCommission = new EventEmitter<OrderCommissionForm>();

  // Forms
  public orderForm: FormGroup = new FormGroup({
    fixCommission: new FormControl(null, [Validators.min(0), Validators.max(999.99)]),
    maxCommission: new FormControl(null),
    iwsProvision: new FormControl(null),
  });

  public iwsCommissionForm: FormGroup = new FormGroup({
    fromOrderValue: new FormControl(null),
    commission: new FormControl(null, [Validators.min(0), Validators.max(100.00)]),
    minCommission: new FormControl(null)
  });

  public disabledButtonsTable: boolean = false;
  selectedOrderCommission!: OrderCommission | undefined;
  orderCommissions: OrderCommission[] = [];
  public showOCCErrorModalOrderCommission: boolean = false;
  
  // Configuration Modal
  visibleModalIWSCommission = false;
  isLoading: boolean = false;
  typeModal: 'create' | 'edit' | 'delete' = 'create';
  @ViewChild('inputNumber') firstInput!: InputNumber;

  // Configuration Table IWS commission
  @ViewChild('dt') dt!: Table;
  cols!: Column[];
  userIwsProvisionPreferences: UserPreference = {};
  tableKey: string = 'IwsProvision'
  dataKeys = ['fromOrderValue', 'commission', 'minCommission'];
  private langSubscription!: Subscription;

  ngOnInit(): void {
    this.orderForm.get('iwsProvision')?.disable();
    this.changeInputOrderForm();

    this.loadColumns();
    this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColumns();
      this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);
    });

    if (this.orderToEdit) {
     this.orderCommissionUtils.getAllOrderCommissionByOrderId(this.orderToEdit.id).subscribe( orderComissions => {
      this.orderCommissions = orderComissions;
     })
    }

  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderToEdit'] && this.orderToEdit) {
      this.orderForm.patchValue({
        fixCommission: this.orderToEdit.fixCommission,
        maxCommission: this.orderToEdit.maxCommission,
        iwsProvision: this.orderToEdit.iwsProvision
      });
      this.orderCommissionUtils.getAllOrderCommissionByOrderId(this.orderToEdit.id).subscribe( orderComissions => {
       this.orderCommissions = orderComissions;
      })
    }
  }

  ngOnDestroy(): void {
    this.langSubscription.unsubscribe();
    this.subscriptions.unsubscribe();
  }

  private changeInputOrderForm(): void {
    this.subscriptions.add(
      this.orderForm.get('fixCommission')?.valueChanges.subscribe((valueFixCommission: number | null) => {
        if (valueFixCommission && valueFixCommission > 0){
          this.orderForm.get('maxCommission')?.disable();
          this.disabledButtonsTable = true;
          this.orderForm.get('iwsProvision')?.setValue(valueFixCommission, { emitEvent: false });
          this.orderForm.get('maxCommission')?.setValue(null, { emitEvent: false })
        } else {
          this.orderForm.get('maxCommission')?.enable();
          this.disabledButtonsTable = false;
          this.orderForm.get('iwsProvision')?.setValue(null, { emitEvent: false });
        }
      })
    );
  }

  onUserIwsProvisionPreferencesChanges(userIwsProvisionPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsProvisionPreferences));
  }

  loadColumns() {
  this.cols = [
    {
      field: 'fromOrderValue',
      customClasses: ['align-right'],
      type: 'double',
      useSameAsEdit: true,
      header: this.translate.instant(_('ORDERS.COMMISSIONS.FROM_VALUE')),
    },
    {
      field: 'commission',
      customClasses: ['align-right'],
      type: 'double',
      header: this.translate.instant(_('ORDERS.COMMISSIONS.COMMISSION')),
    },
    {
      field: 'minCommission',
      customClasses: ['align-right'],
      type: 'double',
      header: this.translate.instant(_('ORDERS.COMMISSIONS.MIN_COMMISSION')),
    },
  ];
  }

  public onSubmit(): void {
    if (this.orderForm.invalid) return
    
    this.orderCommissionForm = {
      fixCommission: this.orderForm.value.fixCommission ?? 0,
      maxCommission: this.orderForm.value.maxCommission ?? 0,
      iwsProvision: this.orderForm.getRawValue().iwsProvision ?? 0
    }

    this.onCreateOrderCommission.emit(this.orderCommissionForm);
  }

  public clearIwsCommissionForm(): void {
    this.orderForm.reset();
  }

  onSubmitIwsCommission(){
    if(this.iwsCommissionForm.invalid) return;
    
    if(this.typeModal === 'create'){
      this.createOrderCommission();
    }else if(this.typeModal === 'edit' && this.selectedOrderCommission){
      this.updateOrderCommission();
    }
  }

  private createOrderCommission(): void {
    const newOrderCommission: Omit<OrderCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      fromOrderValue: this.iwsCommissionForm.value.fromOrderValue ?? 0,
      commission: this.iwsCommissionForm.value.commission ?? 0,
      minCommission: this.iwsCommissionForm.value.minCommission ?? 0,
      order: this.orderToEdit
    }
    
    this.isLoading = true;
    this.orderCommissionUtils.createOrderCommission(newOrderCommission).subscribe({
      next: (created) => {
        this.isLoading = false;
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.orderCommissions.push(created);
        this.closeModalIwsCommission();
      },
      error: (error) => {
        this.isLoading = false;
        console.log(error);
        this.commonMessageService.showErrorCreatedMessage();
      }
    })
  }

  private updateOrderCommission(): void {
    const updateOrderCommission: OrderCommission = {
      ...this.selectedOrderCommission!,
      fromOrderValue: this.iwsCommissionForm.value.fromOrderValue ?? 0,
      commission: this.iwsCommissionForm.value.commission ?? 0,
      minCommission: this.iwsCommissionForm.value.minCommission ?? 0,
    }

    this.isLoading = true;
    this.orderCommissionUtils.updateOrderCommission(updateOrderCommission).subscribe({
      next: (updated) => {
        this.isLoading = false;
        this.commonMessageService.showEditSucessfullMessage();
        this.orderCommissions = this.orderCommissions.map(c => c.id === updated.id ? updated : c);
        this.closeModalIwsCommission();
      },
      error: (error: Error) => {
        this.isLoading = false;
        console.log(error);
        if(error.message === 'Conflict detected: order commission version mismatch'){
          this.closeModalIwsCommission();
          this.showOCCErrorModalOrderCommission = true;
        }else{
          this.commonMessageService.showErrorEditMessage();
        }
      }
    })
  }

  showModalIwsCommission(type: 'create' | 'edit' | 'delete', data?: OrderCommission){
    this.firstInputFocus();
    this.typeModal = type;
    
    if(data && this.typeModal === 'edit'){
      this.selectedOrderCommission = data;
      this.iwsCommissionForm.get('fromOrderValue')?.setValue(data?.fromOrderValue);
      this.iwsCommissionForm.get('commission')?.setValue(data?.commission);
      this.iwsCommissionForm.get('minCommission')?.setValue(data?.minCommission);
    }

    this.visibleModalIWSCommission = true;
  }

  closeModalIwsCommission(){
    this.visibleModalIWSCommission = false;
    this.iwsCommissionForm.reset();
  }

  deleteCommission(id: number){
    this.typeModal = 'delete';
    this.selectedOrderCommission = this.orderCommissions.find(oc => oc.id == id);
    this.visibleModalIWSCommission = true;
  }

  onIwsCommissionDeleteConfirm() {
    this.isLoading = true;

    if (this.selectedOrderCommission) {
      this.orderCommissionUtils.deleteOrderCommission(this.selectedOrderCommission.id).subscribe({
        next: () => {
          this.isLoading = false;
          this.visibleModalIWSCommission = false;
          this.orderCommissions = this.orderCommissions.filter(c => c.id !== this.selectedOrderCommission!.id);
          this.commonMessageService.showDeleteSucessfullMessage();
        },
        error: (error) => {
          this.isLoading = false;
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }

  private firstInputFocus(): void {
    setTimeout(()=>{
      if(this.firstInput.input.nativeElement){
        this.firstInput.input.nativeElement.focus();
      }
    },300)
  }
}
