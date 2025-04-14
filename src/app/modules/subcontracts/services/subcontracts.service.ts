import { Injectable } from '@angular/core';
import { SubcontractDatastoreService } from './subcontracts-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class SubcontractsService {
  constructor(private readonly datastore: SubcontractDatastoreService) {}

  list() {
    return this.datastore.list();
  }
}
