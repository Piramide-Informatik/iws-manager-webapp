import { Component, OnInit, ViewChild } from '@angular/core';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../services/customer.service';
import { Table } from 'primeng/table';

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
    { field: 'id', header: 'No'},
    { field: 'companyName', header: 'Company Name'},
    { field: 'nameLine2', header: 'Name Line 2'},
    { field: 'kind', header: 'Kind'},
    { field: 'land', header: 'Land'},
    { field: 'place', header: 'Place'},
    { field: 'contact', header: 'Contact'},
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
