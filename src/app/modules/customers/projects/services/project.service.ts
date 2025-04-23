import { Injectable } from '@angular/core';
import { ProjectDatastoreService } from './project-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  constructor(private datastore: ProjectDatastoreService) {}

  list() {
    return this.datastore.list();

  }
}