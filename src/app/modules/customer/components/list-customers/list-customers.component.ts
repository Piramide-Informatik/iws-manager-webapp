import { Component, OnInit, ViewChild } from '@angular/core';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../services/customer.service';
import { Table } from 'primeng/table';

@Component({
  selector: 'app-list-customers',
  standalone: false,
  templateUrl: './list-customers.component.html',
  styleUrl: './list-customers.component.scss'
})
export class ListCustomersComponent implements OnInit {
  customers!: Customer[];
  @ViewChild('dt2') dt2!: Table;

  constructor(private customerService: CustomerService) {}

  ngOnInit() {
    this.customers = this.customerService.list();
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
