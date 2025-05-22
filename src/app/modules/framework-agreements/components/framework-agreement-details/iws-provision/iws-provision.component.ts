import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderCommission } from '../../../../../Entities/orderCommission';
import { Table } from 'primeng/table';
import { OrderCommissionService } from '../../../../customer/services/order-commission/order-commission.service';
import { UserPreferenceService } from '../../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../../Entities/user-preference';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
  customClasses?: string[]
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
  selectedOrderCommission!: null;
  orderCommissions: OrderCommission[] = [];

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  cols!: Column[];
  userIwsProvisionPreferences: UserPreference = {};
  tableKey: string = 'IwsProvision'
  dataKeys = ['fromOrderValue', 'commission', 'minCommission'];
  

  constructor( private orderCommissionService: OrderCommissionService, private readonly userPreferenceService: UserPreferenceService ){ }

  ngOnInit(): void {
    this.iwsEmployeeForm = new FormGroup({
      fixCommission: new FormControl('', [Validators.required]),
      maxCommission: new FormControl('', [Validators.required]),
      estimated: new FormControl('', [Validators.required]),
    });
    
    this.orderCommissions = this.orderCommissionService.getOrderCommission();
    this.loadColIwsProvisionHeaders();
    this.loading = false;
    this.userIwsProvisionPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.cols);
  }

  onUserIwsProvisionPreferencesChanges(userIwsProvisionPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userIwsProvisionPreferences));
  }

  loadColIwsProvisionHeaders(): void {
    this.cols = [
      { field: 'fromOrderValue', customClasses: ['align-right'], header: 'ab Wert'},
      { field: 'commission', customClasses: ['align-right'], header: 'Provision' },
      { field: 'minCommission', customClasses: ['align-right'], header: 'Mindestprovision' }
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
