import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderCommission } from '../../../../../Entities/orderCommission';
import { Table } from 'primeng/table';
import { OrderCommissionService } from '../../../../customer/services/order-commission/order-commission.service';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { Subscription } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  customClasses?: string[];
  useSameAsEdit?: boolean;
}

interface ExportColumn {
  title: string;
  dataKey: string;
}


@Component({
  selector: 'app-iws-provision',
  standalone: false,
  templateUrl: './iws-provision.component.html',
  styleUrl: './iws-provision.component.scss'
})
export class IwsProvisionComponent implements OnInit{
  iwsEmployeeForm!: FormGroup;
  iwsCommissionForm!: FormGroup;
  selectedOrderCommission!: null;
  orderCommissions: OrderCommission[] = [];
  
  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  cols!: Column[];
  visibleModalIWSCommission = signal(false);
  optionIwsCommission = {
    new: 'new',
    edit: 'edit'
  };
  optionSelected: string = '';
  userIwsProvisionPreferences: UserPreference = {};
  tableKey: string = 'IwsProvision'
  dataKeys = ['fromOrderValue', 'commission', 'minCommission'];
  private langSubscription!: Subscription;

  constructor( 
    private readonly orderCommissionService: OrderCommissionService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly translate: TranslateService){ }

  ngOnInit(): void {
  this.loadColumns();
  this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);
  this.loading = false;

  this.langSubscription = this.translate.onLangChange.subscribe(() => {
    this.loadColumns();
    this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);
  });

  this.iwsEmployeeForm = new FormGroup({
    fixCommission: new FormControl('', [Validators.required]),
    maxCommission: new FormControl('', [Validators.required]),
    estimated: new FormControl('', [Validators.required]),
  });

  this.iwsCommissionForm = new FormGroup({
    fromOrderValue: new FormControl('', [Validators.required]),
    provision: new FormControl('', [Validators.required]),
    minCommission: new FormControl('', [Validators.required])
  });

  this.orderCommissions = this.orderCommissionService.getOrderCommission();
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

  onSubmit(): void {
    if (this.iwsEmployeeForm.valid) {
      console.log(this.iwsEmployeeForm.value);
    } else {
      console.log("Formulario no válido");
    }
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
