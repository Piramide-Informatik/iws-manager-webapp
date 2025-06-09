import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ContactPerson } from '../../../Entities/contactPerson';

@Injectable({
  providedIn: 'root'
})
export class ContactStateService {
  private readonly editContactSource = new BehaviorSubject<ContactPerson | null>(null);
    currentContact$ = this.editContactSource.asObservable();
  
  setCountryToEdit(contact: ContactPerson | null): void {
    this.editContactSource.next(contact);
  }

  clearCountry() {
    this.editContactSource.next(null);
  }
}
