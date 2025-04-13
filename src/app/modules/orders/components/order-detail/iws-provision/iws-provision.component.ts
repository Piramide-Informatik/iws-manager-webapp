import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderCommission } from '../../../../../Entities/orderCommission';
import { Table } from 'primeng/table';
import { OrderCommissionService } from '../../../../customer/services/order-commission/order-commission.service';

interface Column {
  field: string;
  header: string;
  customExportHeader?: string;
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
    new: 'New',
    edit: 'Edit'
  };
  optionSelected: string = '';

  constructor( private orderCommissionService: OrderCommissionService ){ }

  ngOnInit(): void {
    this.iwsEmployeeForm = new FormGroup({
      fixCommission: new FormControl('', [Validators.required]),
      maxCommission: new FormControl('', [Validators.required]),
      estimated: new FormControl('', [Validators.required]),
    });

    this.iwsCommissionForm = new FormGroup({
      fromOrderValue: new FormControl('', [Validators.required]),
      provision: new FormControl('', [Validators.required]),
      minCommission: new FormControl('', [Validators.required])
    })

    this.orderCommissions = this.orderCommissionService.getOrderCommission();
    this.loading = false;
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


    }else if(this.optionSelected == this.optionIwsCommission.edit){//Edit commission

    }
  }

  showModalIwsCommission(option: string, fromOrderValue?: number){
    this.optionSelected = option;
    
    if(fromOrderValue && this.optionSelected == this.optionIwsCommission.edit){
      let commission = this.orderCommissions.find( orderCommission => orderCommission.fromOrderValue == fromOrderValue);

      this.iwsCommissionForm.get('fromOrderValue')?.setValue(commission?.fromOrderValue);
      this.iwsCommissionForm.get('provision')?.setValue(commission?.commission);
      this.iwsCommissionForm.get('minCommission')?.setValue(commission?.minCommission);
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
