import { Injectable } from '@angular/core';
import { Customer } from '../../../Entities/customer';
import { frameworkDatastoreService } from './framework-agree-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class FrameworkAgreementsService {
  constructor(private datastore: frameworkDatastoreService) {}

  list() {
    return this.datastore.list();

  }
}
