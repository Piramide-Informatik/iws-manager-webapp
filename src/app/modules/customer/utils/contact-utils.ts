import { EnvironmentInjector, Injectable, inject, signal } from '@angular/core';
import { Observable, catchError, map, switchMap, take, throwError } from 'rxjs';
import { ContactPerson } from '../../../Entities/contactPerson';
import { ContactPersonService } from '../../../Services/contact-person.service';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../shared/utils/occ-error';

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

  loadInitialData(): Observable<ContactPerson[]> {
    return this.contactPersonService.loadInitialData();
  }

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
   * @param contact - Contact person data
   * @returns Observable that completes when contact person is created
   */
  createNewContactPerson(contact: Omit<ContactPerson, 'id'>): Observable<void> {
    if (!contact.lastName?.trim()) {
      return throwError(() => new Error('Last name cannot be empty'));
    }

    return this.contactPersonService.addContactPerson({
      firstName: contact.firstName?.trim() ?? '',
      lastName: contact.lastName.trim(),
      forInvoicing: contact.forInvoicing ?? 0,
      function: contact.function?.trim() ?? '',
      salutation: contact.salutation,
      title: contact.title,
      customer: contact.customer,
      email: contact.email?.trim() ?? ''
    }).pipe(
      map(() => void 0), // Convert ContactPerson to void
      catchError(err => {
        console.error('Error creating contact person:', err);
        return throwError(() => new Error('Failed to create contact person'));
      })
    );
  }

  /**
   * Checks if a contact person exists (case-insensitive comparison)
   * @param fullNameContact - First name and last name to check
   * @returns Observable emitting boolean indicating existence
   */
  contactPersonExists(fullNameContact: string): Observable<boolean> {
    return this.contactPersonService.getAllContactPersons().pipe(
      map(contacts => contacts.some(
        c => {
          const fullName = `${c.firstName ?? ''} ${c.lastName ?? ''}`.trim();
          return fullName.toLowerCase() === fullNameContact.toLowerCase();
        }
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
    return this.contactPersonService.getAllContactPersons().pipe(
      map(() => void 0), // Convert to void
      catchError(err => {
        console.error('Error refreshing contact persons:', err);
        return throwError(() => new Error('Failed to refresh contact persons'));
      })
    );
  }

  /**
   * Deletes a contact person by ID and updates the internal contacts persons signal.
   * @param id - ID of the contact person to delete
   * @returns Observable that completes when the deletion is done
   */
  deleteContactPerson(id: number): Observable<void> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid contact person ID'));
    }

    return this.contactPersonService.deleteContactPerson(id)
  }

  /**
 * Updates a contact person by ID and updates the internal contacts persons signal.
 * @param id - ID of the contact person to update
 * @returns Observable that completes when the update is done
 */
  updateContactPerson(contact: ContactPerson): Observable<ContactPerson> {
    if (!contact?.id) {
      return throwError(() => new Error('Invalid contact person data'));
    }

    return this.contactPersonService.getContactPersonById(contact.id).pipe(
      take(1),
      switchMap((currentContact) => {
        if (!currentContact) {
          return throwError(() => createNotFoundUpdateError('Contact'));
        }

        if (currentContact.version !== contact.version) {
          return throwError(() => createUpdateConflictError('Contact'));
        }

        return this.contactPersonService.updateContactPerson(contact);
      })
    );
  }

}