import { Injectable } from '@angular/core';
import { ReceivableDatastoreService } from './receivable-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class ReceivableService {
  constructor(private readonly datastore: ReceivableDatastoreService) {}

  list() {
    return this.datastore.list();
  }
}