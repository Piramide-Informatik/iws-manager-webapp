import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Biller } from '../Entities/biller';


@Injectable({
  providedIn: 'root'
})
export class BillerService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/billers`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };


  private readonly _billers = signal<Biller[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);


  public billers = this._billers.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<Biller[]> {
    this._loading.set(true);
    return this.http.get<Biller[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (billers) => {
          this._billers.set(billers);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load billers');
          console.error('Error loading billers:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addBiller(biller: Omit<Biller, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Biller> {
    return this.http.post<Biller>(this.apiUrl, biller, this.httpOptions).pipe(
      tap({
        next: (newBiller) => {
          this._billers.update(billers => [...billers, newBiller]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add biller');
          console.error('Error adding biller:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updateBiller(updatedBiller: Biller): Observable<Biller> {
    const url = `${this.apiUrl}/${updatedBiller.id}`;
    return this.http.put<Biller>(url, updatedBiller, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._billers.update(billers =>
            billers.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update biller');
          console.error('Error updating biller:', err);
        }
      })
    );
  }

  // DELETE
  deleteBiller(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._billers.update(billers =>
            billers.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete biller');
          console.error('Error deleting biller:', err);
        }
      })
    );
  }

  // READ
  getAllBillers(): Observable<Biller[]> {
    return this.http.get<Biller[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch billers');
        console.error('Error fetching billers:', err);
        return of([]);
      })
    );
  }

  getBillerById(id: number): Observable<Biller | undefined> {
    return this.http.get<Biller>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch biller by id');
        console.error(err);
        return of(undefined as unknown as Biller);
      })
    );
  }

  public refreshBillers(): void {
    this.loadInitialData();
  }
}