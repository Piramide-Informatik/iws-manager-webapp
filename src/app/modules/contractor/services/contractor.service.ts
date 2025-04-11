import { Injectable } from '@angular/core';
import { ContractorDatastoreService } from './contractor-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class ContractorService {
  constructor(private datastore: ContractorDatastoreService) {}

  list() {
    return this.datastore.list();

  }
}