import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { InvoiceType } from '../Entities/invoiceType';


@Injectable({
  providedIn: 'root'
})
export class InvoiceTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/invoice-types`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };


  private readonly _invoiceTypes = signal<InvoiceType[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);


  public invoiceTypes = this._invoiceTypes.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<InvoiceType[]> {
    this._loading.set(true);
    return this.http.get<InvoiceType[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (invoiceTypes) => {
          this._invoiceTypes.set(invoiceTypes);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load invoice types');
          console.error('Error loading invoice types:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addInvoiceType(invoiceType: Omit<InvoiceType, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<InvoiceType> {
    return this.http.post<InvoiceType>(this.apiUrl, invoiceType, this.httpOptions).pipe(
      tap({
        next: (newInvoiceType) => {
          this._invoiceTypes.update(invoiceTypes => [...invoiceTypes, newInvoiceType]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add invoice type');
          console.error('Error adding invoice type:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updateInvoiceType(updatedInvoiceType: InvoiceType): Observable<InvoiceType> {
    const url = `${this.apiUrl}/${updatedInvoiceType.id}`;
    return this.http.put<InvoiceType>(url, updatedInvoiceType, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._invoiceTypes.update(invoiceTypes =>
            invoiceTypes.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update invoice type');
          console.error('Error updating invoice type:', err);
        }
      })
    );
  }

  // DELETE
  deleteInvoiceType(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._invoiceTypes.update(invoiceTypes =>
            invoiceTypes.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete invoice type');
          console.error('Error deleting invoice type:', err);
        }
      })
    );
  }

  // READ
  getAllInvoiceTypes(): Observable<InvoiceType[]> {
    return this.http.get<InvoiceType[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch invoice types');
        console.error('Error fetching invoice types:', err);
        return of([]);
      })
    );
  }

  getInvoiceTypeById(id: number): Observable<InvoiceType | undefined> {
    return this.getAllInvoiceTypes().pipe(
      map(invoiceTypes => invoiceTypes.find(t => t.id === id))
    );
  }

  public refreshInvoiceTypes(): void {
    this.loadInitialData();
  }
}