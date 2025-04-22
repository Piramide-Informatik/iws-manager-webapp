import { Injectable } from '@angular/core';
import { Rol } from '../../../../../Entities/rol';

@Injectable({
  providedIn: 'root'
})
export class RolesDatastoreService {
  constructor() { }

  list(): Rol[] {
    return [
      { function: 'Funktion 1', read: true, insert: false, modify: false, delete: false, execute: false },
      { function: 'Funktion 2', read: true, insert: true, modify: true, delete: true, execute: false },
      { function: 'Funktion 3', read: false, insert: false, modify: false, delete: false, execute: true },
      { function: 'Funktion 4', read: true, insert: true, modify: true, delete: false, execute: false },
      { function: 'Funktion 5', read: true, insert: false, modify: false, delete: false, execute: false },
      { function: 'Funktion 6', read: false, insert: false, modify: false, delete: false, execute: true },
      
    ];
  }
}