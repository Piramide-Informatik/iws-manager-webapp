import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Promoter } from '../Entities/promoter';


@Injectable({
  providedIn: 'root'
})
export class PromoterService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/promoters`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  private readonly _promoters = signal<Promoter[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public promoters = this._promoters.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<Promoter[]> {
    this._loading.set(true);
    return this.http.get<Promoter[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (promoters) => {
          this._promoters.set(promoters);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load promoters');
          console.error('Error loading promoters:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addPromoter(promoter: Omit<Promoter, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Promoter> {
    return this.http.post<Promoter>(this.apiUrl, promoter, this.httpOptions).pipe(
      tap({
        next: (newPromoter) => {
          this._promoters.update(promoters => [...promoters, newPromoter]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add promoter');
          console.error('Error adding promoter:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updatePromoter(updatedPromoter: Promoter): Observable<Promoter> {
    const url = `${this.apiUrl}/${updatedPromoter.id}`;
    return this.http.put<Promoter>(url, updatedPromoter, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._promoters.update(promoters =>
            promoters.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update promoter');
          console.error('Error updating promoter:', err);
        }
      })
    );
  }

  // DELETE
  deletePromoter(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._promoters.update(promoters =>
            promoters.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete promoter');
          console.error('Error deleting promoter:', err);
        }
      })
    );
  }

  // READ
  getAllPromoters(): Observable<Promoter[]> {
    return this.http.get<Promoter[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch promoters');
        console.error('Error fetching promoters:', err);
        return of([]);
      })
    );
  }

  getPromoterById(id: number): Observable<Promoter | undefined> {
    return this.getAllPromoters().pipe(
      map(promoters => promoters.find(t => t.id === id))
    );
  }

  public refreshPromoters(): void {
    this.loadInitialData();
  }
}