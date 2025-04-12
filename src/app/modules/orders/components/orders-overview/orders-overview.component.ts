import { Component, OnInit, ViewChild } from '@angular/core';
import { Table } from 'primeng/table';
import { Order } from '../../../../Entities/order';
import { OrderService } from '../../services/order.service';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-orders-overview',
  standalone: false,
  templateUrl: './orders-overview.component.html',
  styleUrl: './orders-overview.component.scss'
})
export class OrdersOverviewComponent implements OnInit{
 public orders!: Order[];

  public customer!: string;

  @ViewChild('dt2') dt2!: Table;

  public cols: Column[] = [
    { field: 'orderNr', header: 'A-Nr.' },
    { field: 'orderLabel', header: 'Auftrag' },
    { field: 'orderType', header: 'Art' },
    { field: 'orderDate', header: 'Datum' },
    { field: 'acronym', header: 'Akronym' },
    { field: 'fundingProgram', header: 'Förderprogramm' },
    { field: 'value', header: 'Wert' },
    { field: 'contractStatus', header: 'V-Status' },
    { field: 'contractNr', header: 'RV-Nr.' },
    { field: 'contractTitle', header: 'RV' },
    { field: 'iwsPercent', header: 'IWS %' },
    { field: 'iwsPercentValue', header: 'IWS-Wert' }
  ];

  public selectedColumns!: Column[];

  constructor(private orderService: OrderService) { }

  ngOnInit() {
    this.orders = this.orderService.list();

    this.selectedColumns = this.cols;

    this.customer = 'Valentin Laime'
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  deleteCustomer(id: number) {
    //this.contractors = this.contractors.filter( contractor => contractor.contractorLabel !== id);
  }
}
