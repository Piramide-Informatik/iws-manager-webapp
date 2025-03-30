import { Injectable } from '@angular/core';
import { Customer } from '../../../Entities/customer';
import { CustomerDatastoreService } from './customer-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private datastore: CustomerDatastoreService) {}

  list() {
    return this.datastore.list();

  }
}
