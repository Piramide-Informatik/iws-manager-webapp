import { Injectable, inject, signal } from '@angular/core';
import { Salutation } from '../Entities/salutation';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SalutationService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/salutations`;

  private readonly httpOptions = {
    //withCredentials: true,
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  // Signals 
  private readonly _salutations = signal<Salutation[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public salutations = this._salutations.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): Observable<Salutation[]> {
    this._loading.set(true);
    return this.http.get<Salutation[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (salutations) => {
          this._salutations.set(salutations);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load salutations');
          console.error('Error loading salutations:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    )
  }

  // CREATE
  addSalutation(salutation: Omit<Salutation, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Salutation> {
    return this.http.post<Salutation>(this.apiUrl, salutation, this.httpOptions).pipe(
      tap({
        next: (newSalutation) => {
          this._salutations.update(salutations => [...salutations, newSalutation]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add salutation');
          console.error('Error adding salutation:', err);
        }
      })
    )
  }

  // UPDATE
  updateSalutation(updatedSalutation: Salutation): Observable<Salutation> {
    const url = `${this.apiUrl}/${updatedSalutation.id}`;
    return this.http.put<Salutation>(url, updatedSalutation, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._salutations.update(salutations =>
            salutations.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update salutation');
          console.error('Error updating salutation:', err);
        }
      })
    );
  }
  
  // DELETE
  deleteSalutation(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._salutations.update(salutations =>
            salutations.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete salutation');
          console.error('Error deleting salutation:', err);
        }
      })
    );
  }  

  // READ
  getAllSalutations(): Observable<Salutation[]> {
    return this.http.get<Salutation[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch salutations');
        console.error('Error fetching salutations:', err);
        return of([]);
      })
    );
  }
  
  getSalutationById(id: number): Observable<Salutation | undefined> {
    return this.getAllSalutations().pipe(
      map(salutations => salutations.find(t => t.id === id))
    );
  }  

  public refreshSalutations(): void {
    this.loadInitialData();
  }
}
