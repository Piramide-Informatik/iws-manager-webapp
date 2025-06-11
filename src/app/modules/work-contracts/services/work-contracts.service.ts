import { Injectable } from '@angular/core';
import { WorkContract } from '../../../Entities/work-contracts';
import { WorkContractsDataService } from './work-contracts-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class WorkContractsService {
  constructor(private datastore: WorkContractsDataService) {}
  private readonly workContracts = [];

  list() {
    return this.datastore.list();

  }

  addProduct(workContract: WorkContract) {
    return Promise.resolve(this.workContracts);
  }

  updateProduct(updatedWorkContract: WorkContract) {
    return Promise.resolve(this.workContracts);
  }
}
