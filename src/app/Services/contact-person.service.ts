import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { ContactPerson } from '../Entities/contactPerson';

@Injectable({
  providedIn: 'root'
})
export class ContactPersonService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'assets/data/contactPerson.json';

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
    this.http.get<{ contactPersons: ContactPerson[] }>(this.apiUrl).pipe(
      map(response => response.contactPersons),
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
  addContactPerson(person: Omit<ContactPerson, 'uuid'>): void {
    const newPerson: ContactPerson = {
      ...person,
      uuid: this.generateUUID()
    };
    this._contactPersons.update(persons => [...persons, newPerson]);
  }

  // UPDATE
  updateContactPerson(updatedPerson: ContactPerson): void {
    this._contactPersons.update(persons =>
      persons.map(p => p.uuid === updatedPerson.uuid ? updatedPerson : p)
    );
  }

  // DELETE
  deleteContactPerson(uuid: string): void {
    this._contactPersons.update(persons =>
      persons.filter(p => p.uuid !== uuid)
    );
  }

  // READ
  getAllContactPersons(): Observable<ContactPerson[]> {
    return this.http.get<{ contactPersons: ContactPerson[] }>(this.apiUrl).pipe(
      map(response => response.contactPersons),
      catchError(() => of([]))
    );
  }

  getContactPersonById(id: number): Observable<ContactPerson | undefined> {
    return this.getAllContactPersons().pipe(
      map(persons => persons.find(p => p.id === id))
    );
  }

  // Helper
  private generateUUID(): string {
    return crypto.randomUUID();
  }
}
