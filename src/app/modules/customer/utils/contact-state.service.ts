import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContactPerson } from '../../../Entities/contactPerson';

@Injectable({
  providedIn: 'root'
})
export class ContactStateService {
  private readonly editContactSource = new BehaviorSubject<ContactPerson | null>(null);
    currentContact$ = this.editContactSource.asObservable();
  
  setContactToEdit(contact: ContactPerson | null): void {
    this.editContactSource.next(contact);
  }

  clearContact() {
    this.editContactSource.next(null);
  }
}
