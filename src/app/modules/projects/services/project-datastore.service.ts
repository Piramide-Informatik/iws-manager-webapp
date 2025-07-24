import { Injectable } from '@angular/core';
import { Project } from '../../../Entities/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectDatastoreService {
  constructor() { }

  list(): Project[] {
    return [];
  }
}
