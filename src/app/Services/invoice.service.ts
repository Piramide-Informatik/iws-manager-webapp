import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Invoice } from '../Entities/invoices';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/invoices`;
  //Signals
  private readonly _invoices = signal<Invoice[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public invoices = this._invoices.asReadonly();
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
   * Creates a new invoice record
   * @param invoice Inovice data (without id, timestamps and version)
   * @returns Observable with the created Invoice object
   * @throws Error when validation fails or server error occurs
   */
  addInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Invoice> {
    return this.http.post<Invoice>(this.apiUrl, invoice, this.httpOptions).pipe(
      tap({
        next: (newInvoice) => {
          this._invoices.update(invoices => [...invoices, newInvoice]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add invoice');
          console.error('Error adding invoice:', err);
          return of(invoice);
        }
      })
    );
  }

  /**
   * Retrieves a single invoice by ID
   * @param id Invoice identifier
   * @returns Observable with Invoice object
   * @throws Error when invoice not found or server error occurs
   */
  getInvoiceById(id: number): Observable<Invoice | undefined> {
    return this.http.get<Invoice>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch invoice by id');
        console.error(err);
        return of(undefined as unknown as Invoice);
      })
    );
  }

  /**
   * Retrieves all invoices given a customer
   * @param customerId Customer to get his invoices
   * @returns Observable with Invoice array
   * @throws Error when server request fails
   */
  getAllInvoicesByCustomerId(customerId: number): Observable<Invoice[]> {
    return this.http.get<Invoice[]>(`${this.apiUrl}/by-customer/${customerId}/sort-by-invoiceno`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch invoices');
        console.error('Error fetching invoices:', err);
        return of([]);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing invoice
   * @param updatedInvoice Partial invoice data with updates
   * @returns Observable with updated Invoice object
   * @throws Error when invoice not found or validation fails
   */
  updateInvoice(updatedInvoice: Invoice): Observable<Invoice> {
    const url = `${this.apiUrl}/${updatedInvoice.id}`;
    return this.http.put<Invoice>(url, updatedInvoice, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._invoices.update(invoices =>
            invoices.map(e => e.id === res.id ? res : e)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update invoice');
          console.error('Error updating invoice:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a invoice record
   * @param id Invoice identifier to delete
   * @returns Empty Observable
   * @throws Error when invoice not found or server error occurs
   */
  deleteInvoice(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._invoices.update(invoices =>
            invoices.filter(e => e.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete invoice');
        }
      })
    )
  }

  /**
  * Cleans the state of the invoices
  */
  clearInvoices(): void {
    this._invoices.set([]);
    this._error.set(null);
  }

  updateInvoiceData(invoices: Invoice[]) {
    this._invoices.set(invoices)
  }
}