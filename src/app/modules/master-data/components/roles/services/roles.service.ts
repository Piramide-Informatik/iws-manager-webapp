import { Injectable } from '@angular/core';
import { RolesDatastoreService } from './roles-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class RolesService {
  constructor(private readonly datastore: RolesDatastoreService) {}

  list() {
    return this.datastore.list();

  }
}