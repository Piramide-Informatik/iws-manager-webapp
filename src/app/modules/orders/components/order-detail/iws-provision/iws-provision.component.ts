import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, signal, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderCommission } from '../../../../../Entities/orderCommission';
import { Table } from 'primeng/table';
import { OrderCommissionService } from '../../../../customer/services/order-commission/order-commission.service';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { Order } from '../../../../../Entities/order';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  customClasses?: string[];
  useSameAsEdit?: boolean;
}

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
  private readonly orderCommissionService = inject(OrderCommissionService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly translate = inject(TranslateService);
  private readonly subscriptions = new Subscription();

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
    fromOrderValue: new FormControl(''),
    provision: new FormControl(''),
    minCommission: new FormControl('')
  });

  public disabledButtonsTable: boolean = false;
  selectedOrderCommission!: null;
  orderCommissions: OrderCommission[] = [];
  
  // Configuration Modal
  visibleModalIWSCommission = signal(false);
  optionIwsCommission = {
    new: 'new',
    edit: 'edit'
  };
  optionSelected: string = '';

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

    this.orderCommissions = this.orderCommissionService.getOrderCommission();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['orderToEdit'] && this.orderToEdit) {
      this.orderForm.patchValue({
        fixCommission: this.orderToEdit.fixCommission,
        maxCommission: this.orderToEdit.maxCommission,
        iwsProvision: this.orderToEdit.iwsProvision
      });
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
      useSameAsEdit: true,
      header: this.translate.instant(_('ORDERS.COMMISSIONS.FROM_VALUE')),
    },
    {
      field: 'commission',
      customClasses: ['align-right'],
      header: this.translate.instant(_('ORDERS.COMMISSIONS.COMMISSION')),
    },
    {
      field: 'minCommission',
      customClasses: ['align-right'],
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

  addIwsCommission(){
  
    if(this.optionSelected == this.optionIwsCommission.new){//Add new commission
      console.log('add new commission');

    }else {//Edit commission
      console.log('edit commission');
      
    }
  }

  showModalIwsCommission(option: string, data?: any){
    this.optionSelected = option;
    
    if(data && this.optionSelected == this.optionIwsCommission.edit){
      this.iwsCommissionForm.get('fromOrderValue')?.setValue(data?.fromOrderValue);
      this.iwsCommissionForm.get('provision')?.setValue(data?.commission);
      this.iwsCommissionForm.get('minCommission')?.setValue(data?.minCommission);
    }

    this.visibleModalIWSCommission.set(true);
  }

  closeModalIwsCommission(){
    this.visibleModalIWSCommission.set(false);
    this.iwsCommissionForm.reset();
    this.optionSelected = '';
  }

  deleteCommission(fromOrderValue: number){
    this.orderCommissions = this.orderCommissions.filter( orderCommission => orderCommission.fromOrderValue != fromOrderValue);
  }
}
