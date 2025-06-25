import { EnvironmentInjector, Injectable, inject, runInInjectionContext, signal } from '@angular/core';
import { Observable, catchError, filter, map, take, throwError } from 'rxjs';
import { ContactPerson } from '../../../Entities/contactPerson';
import { ContactPersonService } from '../../../Services/contact-person.service';
import { toObservable } from '@angular/core/rxjs-interop';

/**
 * Utility class for contact person-related business logic and operations.
 * Works with ContactPersonService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class ContactUtils {
  private readonly contactPersonService = inject(ContactPersonService);
  private readonly injector = inject(EnvironmentInjector);

  private readonly contactCreated = signal<ContactPerson | null>(null);
  private readonly contactCreationError = signal<string | null>(null);

  public readonly contactCreated$ = this.contactCreated.asReadonly();
  public readonly contactCreationError$ = this.contactCreationError.asReadonly();


  /**
   * Gets a contact person by ID with proper error handling
   * @param id - ID of the contact person to retrieve
   * @returns Observable emitting the contact person or undefined if not found
   */
  getContactPersonById(id: number): Observable<ContactPerson | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid contact person ID'));
    }

    return this.contactPersonService.getContactPersonById(id).pipe(
      catchError(err => {
        return throwError(() => new Error('Failed to load contact person'));
      })
    );
  }

  /**
   * Creates a new contact person with validation
   * @param firstName - First name for the new contact person
   * @param lastName - Last name for the new contact person
   * @returns Observable that completes when salutation is created
   */
  createNewContactPerson(contact: Omit<ContactPerson, 'id'>): Observable<void> {
    if (!contact.lastName?.trim()) {
      return throwError(() => new Error('last name cannot be empty'));
    }

    return new Observable<void>(subscriber => {
      this.contactPersonService.addContactPerson({
        firstName: contact.firstName?.trim(),
        lastName: contact.lastName?.trim(),
        forInvoicing: contact.forInvoicing,
        function: contact.function?.trim(),
        salutation: contact.salutation,
        title: contact.title,
        customer: contact.customer,
      });

      // Complete the observable after operation
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Checks if a contact person exists (case-insensitive comparison)
   * @param name - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  contactPersonExists(name: string): Observable<boolean> {
    return this.contactPersonService.getAllContactPersons().pipe(
      map(contacts => contacts.some(
        c => c.firstName?.toLowerCase() === name.toLowerCase()
      )),
      catchError(err => {
        console.error('Error checking contact person existence:', err);
        return throwError(() => new Error('Failed to check contact person existence'));
      })
    );
  }

  /**
   * Gets all contact person sorted alphabetically by first name
   * @returns Observable emitting sorted array of contacts persons
   */
  getContactPersonSortedByFirstName(): Observable<ContactPerson[]> {
    return this.contactPersonService.getAllContactPersons().pipe(
      map(contacts => [...contacts].sort((a, b) => a.firstName!.localeCompare(b.firstName!))),
      catchError(err => {
        console.error('Error sorting contacts persons:', err);
        return throwError(() => new Error('Failed to sort contacts persons'));
      })
    );
  }

  /**
   * Refreshes contact person data
   * @returns Observable that completes when refresh is done
   */
  refreshContactsPersons(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.contactPersonService.refreshContactPersons();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a contact person by ID and updates the internal contacts persons signal.
 * @param id - ID of the contact person to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteContactPerson(id: number): Observable<void> {
    return new Observable(observer => {
      this.contactPersonService.deleteContactPerson(id);

      setTimeout(() => {
        if (!this.contactPersonService.error()) {
          observer.next();
          observer.complete();
        } else {
          observer.error(this.contactPersonService.error());
        }
      }, 100);
    });
  }

  /**
 * Updates a contact person by ID and updates the internal contacts persons signal.
 * @param id - ID of the contact person to update
 * @returns Observable that completes when the update is done
 */
  // updateContactPerson(contact: ContactPerson): Observable<ContactPerson> {
  //   if (!contact?.id) {
  //     return throwError(() => new Error('Invalid contact person data'));
  //   }

  //   return new Observable<ContactPerson>(observer => {
  //     this.contactPersonService.updateContactPerson(contact);

  //     runInInjectionContext(this.injector, () => {
  //       const sub = this.waitForUpdatedSalutation(contact.id, observer);
  //       const errorSub = this.listenForUpdateErrors(observer);

  //       // Cleanup
  //       return () => {
  //         sub.unsubscribe();
  //         errorSub.unsubscribe();
  //       };
  //     });
  //   });
  // }

  updateContactPerson(contact: ContactPerson): Observable<ContactPerson> {
    if (!contact?.id) {
      return throwError(() => new Error('Invalid contact person data'));
    }

    return this.contactPersonService.updateContactPerson(contact);
  }

  private waitForUpdatedSalutation(id: number, observer: any) {
    return toObservable(this.contactPersonService.contactPersons).pipe(
      map(contacts => contacts.find(c => c.id === id)),
      filter(updated => !!updated),
      take(1)
    ).subscribe({
      next: (updatedContactPerson) => {
        observer.next(updatedContactPerson);
        observer.complete();
      },
      error: (err) => observer.error(err)
    });
  }

  private listenForUpdateErrors(observer: any) {
    return toObservable(this.contactPersonService.error).pipe(
      filter(error => !!error),
      take(1)
    ).subscribe({
      next: (err) => observer.error(err)
    });
  }
}