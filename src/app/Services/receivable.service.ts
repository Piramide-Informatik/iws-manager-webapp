import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { Debt } from '../Entities/debt';


@Injectable({
  providedIn: 'root'
})
export class ReceivableService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/debts`;
  //Signals
  private readonly _receivables = signal<Debt[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public receivables = this._receivables.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    })
  };

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new receivable record
   * @param receivable receivable data (without id, timestamps and version)
   * @returns Observable with the created receivable object
   * @throws Error when validation fails or server error occurs
   */
  addReceivable(receivable: Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Debt> {
    return this.http.post<Debt>(this.apiUrl, receivable, this.httpOptions).pipe(
      tap({
        next: (newReceivable) => {
          this._receivables.update(receivables => [...receivables, newReceivable]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add receivable');
          console.error('Error adding receivable:', err);
          return of(receivable);
        }
      })
    );
  }

  /**
   * Retrieves a single receivable by ID
   * @param id Receivable identifier
   * @returns Observable with Receivable object
   * @throws Error when receivable not found or server error occurs
   */
  getReceivableById(id: number): Observable<Debt | undefined> {
    return this.http.get<Debt>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch receivable by id');
        console.error(err);
        return of(undefined as unknown as Debt);
      })
    );
  }

  /**
   * Retrieves all receivables given a customer
   * @param customerId Customer to get his receivables
   * @returns Observable with Receivable array
   * @throws Error when server request fails
   */
  getAllReceivablesByCustomerId(customerId: number): Observable<Debt[]> {
    return this.http.get<Debt[]>(`${this.apiUrl}/by-customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch receivables');
        console.error('Error fetching receivables:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves all receivables given a order
   * @param orderId Order to get his receivables
   * @returns Observable with Receivable array
   * @throws Error when server request fails
   */
  getAllReceivableByOrderId(orderId: number): Observable<Debt[]> {
    return this.http.get<Debt[]>(`${this.apiUrl}/by-orderid/${orderId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch receivables');
        console.error('Error fetching receivables:', err);
        return of([]);
      })
    );
  }
  
  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing receivable
   * @param id Receivable identifier to update
   * @param receivable Partial receivable data with updates
   * @returns Observable with updated Receivable object
   * @throws Error when receivable not found or validation fails
   */
  updateReceivable(updatedReceivable: Debt): Observable<Debt> {
    const url = `${this.apiUrl}/${updatedReceivable.id}`;
    return this.http.put<Debt>(url, updatedReceivable, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._receivables.update(receivables =>
            receivables.map(s => s.id === res.id ? res : s)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update receivable');
          console.error('Error updating receivable:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a receivable record
   * @param id receivable identifier to delete
   * @returns Empty Observable
   * @throws Error when receivable not found or server error occurs
   */
  deleteReceivable(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._receivables.update(receivables =>
            receivables.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete receivable');
        }
      })
    )
  }

  /**
  * Cleans the state of the receivables
  */
  clearReceivables(): void {
    this._receivables.set([]);
    this._error.set(null);
  }

  updateReceivableData(receivables: Debt[]) {
    this._receivables.set(receivables)
  }
} 