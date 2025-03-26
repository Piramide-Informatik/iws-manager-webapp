import { Component, OnInit } from '@angular/core';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../services/customer.service';

@Component({
  selector: 'app-list-customers',
  standalone: false,
  templateUrl: './list-customers.component.html',
  styleUrl: './list-customers.component.scss'
})
export class ListCustomersComponent implements OnInit {

  constructor(private customerService: CustomerService) {}

  ngOnInit() {

  }
}
