import { Injectable } from '@angular/core';
import { Invoice } from '../../../Entities/invoices';

@Injectable({
  providedIn: 'root',
})
export class InvoicesDatastoreService {
  constructor() {}

  list(): Invoice[] {
    return [];
  }
}
