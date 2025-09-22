import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { VatRate } from '../Entities/vatRate';

@Injectable({
  providedIn: 'root'
})
export class VatRateService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/vat-rates`;

  private readonly _vatRates = signal<VatRate[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public vatRates = this._vatRates.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

    private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    })
  };

  constructor() {
    this.loadInitialData();
  }

  loadInitialData(): Observable<VatRate[]> {
    this._loading.set(true);
    return this.http.get<VatRate[]>(this.apiUrl, this.httpOptions).pipe(
       tap({
         next: (vatRates) => {
           this._vatRates.set(vatRates);
           this._error.set(null);
         },
         error: (err) => {
           this._error.set('Failed to load vatRates');
           console.error('Error loading vatRates:', err);
         }
       }),
       catchError(() => of([])),
       tap(() => this._loading.set(false))
     )
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new vatRate record
   * @param vatRate VatRate data (without id and timestamps)
   * @returns Observable with the created VatRate object
   * @throws Error when validation fails or server error occurs
   */
  addVatRate(vatRate: Omit<VatRate, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<VatRate> {
    return this.http.post<VatRate>(this.apiUrl, vatRate, this.httpOptions).pipe(
      tap({
        next: (newVatRate) => {
          this._vatRates.update(vatRates => [...vatRates, newVatRate]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add vatRate');
          console.error('Error adding vatRate:', err);
        }
      })
    )
  }

 // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all vatRates
   * @returns Observable with VatRate array
   * @throws Error when server request fails
   */
  getAllVatRates(): Observable<VatRate[]> {
    return this.http.get<VatRate[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch vatRates');
        console.error('Error fetching vatRates:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single vatRate by ID
   * @param id VatRate identifier
   * @returns Observable with VatRate object
   * @throws Error when vatRate not found or server error occurs
   */
  getVatRateById(id: number): Observable<VatRate | undefined> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<VatRate>(url, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch VatRate');
        console.error('Error fetching VatRate:', err);
        return of(null as unknown as VatRate);
      })
    );
  }  

  /**
   * Retrieves all vatRate by vat id
   * @param id Vat identifier
   * @returns Observable with VatRate object
   * @throws Error when vatRate not found or server error occurs
   */
  getAllVatRatesByVatId(id: number): Observable<VatRate[]> {
    const url = `${this.apiUrl}/by-vat/${id}`;
    return this.http.get<VatRate[]>(url, this.httpOptions).pipe(
      tap({
        next: (vatRates) => {
          this._vatRates.set(vatRates);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load vatRates');
          console.error('Error loading vatRates:', err);
        }
      }),
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch VatRate by Vat');
        console.error('Error fetching VatRate by Vat:', err);
        return of([]);
      })
    );
  } 

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing vatRate
   * @param id VatRate identifier to update
   * @param vatRate Partial vatRate data with updates
   * @returns Observable with updated VatRate object
   * @throws Error when vatRate not found or validation fails
   */
  updateVatRate(updatedVatRate: VatRate): Observable<VatRate> {
    const url = `${this.apiUrl}/${updatedVatRate.id}`;
    return this.http.put<VatRate>(url, updatedVatRate, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._vatRates.update(vatRates =>
            vatRates.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update vatRate');
          console.error('Error updating vatRate:', err);
        }
      })
    );
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a vatRate record
   * @param id VatRate identifier to delete
   * @returns Empty Observable
   * @throws Error when vatRate not found or server error occurs
   */
  deleteVatRate(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._vatRates.update(vatRates =>
            vatRates.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete vatRate');
          console.log('Error deleting vat rate:', err);
        }
      })
    );
  }  

  public refreshVatRates(): void {
    this.loadInitialData();
  }

  /**
  * Cleans the state of the vatRate
  */
  clearVatRates(): void {
    this._vatRates.set([]);
    this._error.set(null);
  }
}