import { Component, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { OrderCommission } from '../../../../../../Entities/orderCommission';
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
  selectedOrderCommission!: null;
  orderCommissions: OrderCommission[] = [];

  @ViewChild('dt') dt!: Table;
  loading: boolean = true;
  cols!: Column[];

  constructor( private readonly orderCommissionService: OrderCommissionService ){ }

  ngOnInit(): void {
    this.iwsEmployeeForm = new FormGroup({
      fixCommission: new FormControl('', [Validators.required]),
      maxCommission: new FormControl('', [Validators.required]),
      estimated: new FormControl('', [Validators.required]),
    });

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

}
