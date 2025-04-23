import { Injectable } from '@angular/core';
import { FrameworkDatastoreService } from './framework-agree-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class FrameworkAgreementsService {
  constructor(private readonly datastore: FrameworkDatastoreService) {}

  list() {
    return this.datastore.list();

  }
}
