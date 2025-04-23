import { Injectable } from '@angular/core';
import { CustomerDatastoreService } from './customer-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private readonly datastore: CustomerDatastoreService) {}

  list() {
    return this.datastore.list();

  }
}
