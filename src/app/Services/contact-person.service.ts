import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ContactPerson } from '../Entities/contactPerson';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ContactPersonService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/contacts`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  private readonly _contactPersons = signal<ContactPerson[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public contactPersons = this._contactPersons.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this._loading.set(true);
    this.http.get<ContactPerson[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (persons) => {
          this._contactPersons.set(persons);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load contact persons');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    ).subscribe();
  }

  // CREATE
  addContactPerson(person: Omit<ContactPerson, 'id'>): void {
    this.http.post<ContactPerson>(this.apiUrl, person, this.httpOptions).pipe(
      tap({
        next: (newContactPerson) => {
          this._contactPersons.update(contacts => [...contacts, newContactPerson]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add title');
          console.error('Error adding title:', err);
        }
      })
    ).subscribe();
  }

  // UPDATE
  updateContactPerson(updatedPerson: ContactPerson): void {
    const url = `${this.apiUrl}/${updatedPerson.id}`;
    this.http.put<ContactPerson>(url, updatedPerson, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._contactPersons.update(persons =>
            persons.map(p => p.id === res.id ? res : p)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update contact person');
          console.error('Error updating contact person:', err);
        }
      })
    ).subscribe();
  }

  // DELETE
  deleteContactPerson(id: number): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._contactPersons.update(contacts =>
            contacts.filter(c => c.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete contact person');
          console.error('Error deleting contact person:', err);
        }
      })
    ).subscribe();
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all contacts
   * @returns Observable with Contacts array
   * @throws Error when server request fails
   */
  getAllContactPersons(): Observable<ContactPerson[]> {
    return this.http.get<ContactPerson[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch contacts persons');
        console.error('Error fetching contacts persons:', err);
        return of([]);
      })
    );
  }

  getContactPersonById(id: number): Observable<ContactPerson | undefined> {
    return this.getAllContactPersons().pipe(
      map(persons => persons.find(p => p.id === id))
    );
  }

  public refreshContactPersons(): void {
    this.loadInitialData();
  }
}
