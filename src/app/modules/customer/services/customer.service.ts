import { Injectable } from '@angular/core';
import { Customer } from '../../../Entities/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  constructor() { }

  list(){
    const customers: Customer[] = [];
    return customers;
  }
}
