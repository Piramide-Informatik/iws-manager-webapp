import { Injectable } from '@angular/core';
import { OrderDatastoreService } from './order-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class OrderService {
  constructor(private datastore: OrderDatastoreService) {}

  list() {
    return this.datastore.list();

  }
}