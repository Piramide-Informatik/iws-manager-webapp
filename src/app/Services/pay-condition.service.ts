import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { PayCondition } from '../Entities/payCondition';


@Injectable({
  providedIn: 'root'
})
export class PayConditionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/pay-condition`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };


  private readonly _payConditions = signal<PayCondition[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);


  public payConditions = this._payConditions.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<PayCondition[]> {
    this._loading.set(true);
    return this.http.get<PayCondition[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (payConditions) => {
          this._payConditions.set(payConditions);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load pay conditions');
          console.error('Error loading pay conditions:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addPayCondition(payCondition: Omit<PayCondition, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<PayCondition> {
    return this.http.post<PayCondition>(this.apiUrl, payCondition, this.httpOptions).pipe(
      tap({
        next: (newPayCondition) => {
          this._payConditions.update(payConditions => [...payConditions, newPayCondition]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add pay condition');
          console.error('Error adding pay condition:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updatePayCondition(updatedPayCondition: PayCondition): Observable<PayCondition> {
    const url = `${this.apiUrl}/${updatedPayCondition.id}`;
    return this.http.put<PayCondition>(url, updatedPayCondition, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._payConditions.update(payConditions =>
            payConditions.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update pay condition');
          console.error('Error updating pay condition:', err);
        }
      })
    );
  }

  // DELETE
  deletePayCondition(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._payConditions.update(payConditions =>
            payConditions.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete pay condition');
          console.error('Error deleting pay condition:', err);
        }
      })
    );
  }

  // READ
  getAllPayConditions(): Observable<PayCondition[]> {
    return this.http.get<PayCondition[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch pay conditions');
        console.error('Error fetching pay conditions:', err);
        return of([]);
      })
    );
  }

  getPayConditionById(id: number): Observable<PayCondition | undefined> {
    return this.http.get<PayCondition>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch pay condition by id');
        console.error(err);
        return of(undefined as unknown as PayCondition);
      })
    );
  }

  public refreshPayConditions(): void {
    this.loadInitialData();
  }
}