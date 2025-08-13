import { Injectable } from '@angular/core';
import { Order } from '../../../Entities/order';

@Injectable({
  providedIn: 'root'
})
export class OrderDatastoreService {
  constructor() { }

  list(): Order[] {
    return [];
  }
}

