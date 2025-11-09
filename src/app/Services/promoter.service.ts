import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
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

  private sortAlphabetically(list: Promoter[]): Promoter[] {
    return [...list].sort((a, b) => {
      const projectPA = a.promoterNo || '';
      const projectPB = b.promoterNo || '';
      return projectPA.localeCompare(projectPB, undefined, { sensitivity: 'base' });
    });
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
          this._promoters.update(promoters => this.sortAlphabetically([...promoters, newPromoter]));
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

  addPromoterWithAutoNumber(promoter: Omit<Promoter, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'promoterNo'>): Observable<Promoter> {
    const createUrl = `${this.apiUrl}/with-auto-promoterno`;
    return this.http.post<Promoter>(createUrl, promoter, this.httpOptions).pipe(
      tap({
        next: (newPromoter) => {
          this._promoters.update(promoters => this.sortAlphabetically([...promoters, newPromoter]));
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add promoter with auto number');
          console.error('Error adding promoter with auto number:', err);
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
            this.sortAlphabetically(promoters.map(t => t.id === res.id ? res : t))
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
    return this.http.get<Promoter>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch promoter by id');
        console.error(err);
        return of(undefined as unknown as Promoter);
      })
    );
  }

  /**
  * Gets the next available promoter number
  * @returns Observable with the next promoter number as string
  */
  getNextPromoterNo(): Observable<string> {
    const url = `${this.apiUrl}/next-promoter-no`;
    return this.http.get<string>(url, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch next promoter number');
        console.error('Error fetching next promoter number:', err);
        return of('');
      })
    );
  }

  public refreshPromoters(): void {
    this.loadInitialData();
  }
}