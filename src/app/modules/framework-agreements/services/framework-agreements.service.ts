import { Injectable } from '@angular/core';
import { frameworkDatastoreService } from './framework-agree-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class FrameworkAgreementsService {
  constructor(private readonly datastore: frameworkDatastoreService) {}

  list() {
    return this.datastore.list();

  }
}
