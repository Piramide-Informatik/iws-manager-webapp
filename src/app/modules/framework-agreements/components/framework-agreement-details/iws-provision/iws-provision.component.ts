import { Component, inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderCommission } from '../../../../../Entities/orderCommission';
import { Table } from 'primeng/table';
import { OrderCommissionService } from '../../../../customer/services/order-commission/order-commission.service';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  customClasses?: string[]
}

@Component({
  selector: 'app-iws-provision',
  standalone: false,
  templateUrl: './iws-provision.component.html',
  styleUrl: './iws-provision.component.scss'
})
export class IwsProvisionComponent implements OnInit, OnDestroy{
  
  private readonly orderCommissionService = inject(OrderCommissionService); 
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly translate = inject(TranslateService);
  private langSubscription!: Subscription;
  iwsEmployeeForm!: FormGroup;
  selectedOrderCommission!: null;
  orderCommissions: OrderCommission[] = [];

  @ViewChild('dt') dt!: Table;
  public loading: boolean = false;
  public cols!: Column[];
  public selectedColumns!: Column[];
  userIwsProvisionPreferences: UserPreference = {};
  tableKey: string = 'IwsProvision'
  dataKeys = ['fromOrderValue', 'commission', 'minCommission'];
  

  constructor(){ }

  ngOnInit(): void {
    this.iwsEmployeeForm = new FormGroup({
      fixCommission: new FormControl('', [Validators.required]),
      maxCommission: new FormControl('', [Validators.required]),
      estimated: new FormControl('', [Validators.required]),
    });
    
    this.updateHeadersAndColumns();
    this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateHeadersAndColumns();
      this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    })
    this.orderCommissions = this.orderCommissionService.getOrderCommission();
  }

  ngOnDestroy(): void {
    if(this.langSubscription){
      this.langSubscription.unsubscribe();
    }
  }

  onUserIwsProvisionPreferencesChanges(userIwsProvisionPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsProvisionPreferences));
  }

  private updateHeadersAndColumns(): void {
    this.loadColIwsProvisionHeaders();
    this.selectedColumns = [...this.cols];
  }

  loadColIwsProvisionHeaders(): void {
    this.cols = [
      { field: 'fromOrderValue', customClasses: ['align-right'], header: this.translate.instant('FRAMEWORK-AGREEMENTS.DETAIL.FORM_TABLE_IWS_COMMISSION.FROM_VALUE')},
      { field: 'commission', customClasses: ['align-right'], header: this.translate.instant('FRAMEWORK-AGREEMENTS.DETAIL.FORM_TABLE_IWS_COMMISSION.COMMISSION') },
      { field: 'minCommission', customClasses: ['align-right'], header: this.translate.instant('FRAMEWORK-AGREEMENTS.DETAIL.FORM_TABLE_IWS_COMMISSION.MIN_COMMISSION') }
    ];
  }

  onSubmit(): void {
    if (this.iwsEmployeeForm.valid) {
      console.log(this.iwsEmployeeForm.value);
    } else {
      console.log("Formulario no válido");
    }
  }

}
