import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Vat } from '../Entities/vat';

@Injectable({
  providedIn: 'root'
})
export class VatService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/vats`;

  private readonly _vats = signal<Vat[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public vats = this._vats.asReadonly();
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

  loadInitialData(): Observable<Vat[]> {
    this._loading.set(true);
    return this.http.get<Vat[]>(this.apiUrl, this.httpOptions).pipe(
       tap({
         next: (vats) => {
           this._vats.set(vats);
           this._error.set(null);
         },
         error: (err) => {
           this._error.set('Failed to load vats');
           console.error('Error loading vats:', err);
         }
       }),
       catchError(() => of([])),
       tap(() => this._loading.set(false))
     )
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new vat record
   * @param vat Vat data (without id and timestamps)
   * @returns Observable with the created Vat object
   * @throws Error when validation fails or server error occurs
   */
  addVat(vat: Omit<Vat, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Vat> {
    return this.http.post<Vat>(this.apiUrl, vat, this.httpOptions).pipe(
      tap({
        next: (newVat) => {
          this._vats.update(vats => [...vats, newVat]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add vat');
          console.error('Error adding vat:', err);
        }
      })
    )
  }

 // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all vats
   * @returns Observable with Vat array
   * @throws Error when server request fails
   */
  getAllVats(): Observable<Vat[]> {
    return this.http.get<Vat[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch vats');
        console.error('Error fetching vats:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single vat by ID
   * @param id Vat identifier
   * @returns Observable with Vat object
   * @throws Error when vat not found or server error occurs
   */
  getVatById(id: number): Observable<Vat | undefined> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Vat>(url, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch Vat');
        console.error('Error fetching Vat:', err);
        return of(null as unknown as Vat);
      })
    );
  }  

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing vat
   * @param id Vat identifier to update
   * @param vat Partial vat data with updates
   * @returns Observable with updated Vat object
   * @throws Error when vat not found or validation fails
   */
  updateVat(updatedVat: Vat): Observable<Vat> {
    const url = `${this.apiUrl}/${updatedVat.id}`;
    return this.http.put<Vat>(url, updatedVat, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._vats.update(vats =>
            vats.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update vat');
          console.error('Error updating vat:', err);
        }
      })
    );
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a vat record
   * @param id Vat identifier to delete
   * @returns Empty Observable
   * @throws Error when vat not found or server error occurs
   */
  deleteVat(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._vats.update(vats =>
            vats.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete vat');
        }
      })
    );
  }  

  public refreshVats(): void {
    this.loadInitialData();
  }
}