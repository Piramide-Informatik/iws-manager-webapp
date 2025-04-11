import { Component, OnInit, ViewChild } from '@angular/core';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../services/customer.service';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';

interface Column {
  field: string,
  header: string
}

@Component({
  selector: 'app-list-customers',
  standalone: false,
  templateUrl: './list-customers.component.html',
  styleUrl: './list-customers.component.scss'
})
export class ListCustomersComponent implements OnInit {

  public customers!: Customer[];

  @ViewChild('dt2') dt2!: Table;

  public cols: Column[] = [
    { field: 'id', header: 'Nr.'},
    { field: 'companyName', header: 'Unternehmensname'},
    { field: 'nameLine2', header: 'Name Zeile 2'},
    { field: 'kind', header: 'Art'},
    { field: 'land', header: 'Land'},
    { field: 'place', header: 'Ort'},
    { field: 'contact', header: 'Ansprechpartner'},
  ];

  public selectedColumns!: Column[];

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customers = this.customerService.list();

    this.selectedColumns = this.cols;
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  deleteCustomer(id: number){
    this.customers = this.customers.filter( customer => customer.id !== id);
  }
  
}
