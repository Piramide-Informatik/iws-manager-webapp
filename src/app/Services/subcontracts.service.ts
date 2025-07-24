import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { Subcontract } from '../Entities/subcontract';

@Injectable({
  providedIn: 'root'
})
export class SubcontractService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/subcontracts`;
  //Signals
  private readonly _subcontracts = signal<Subcontract[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public subcontracts = this._subcontracts.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    })
  };

  constructor(){
    this.loadInitialData();
  }

  public loadInitialData(): void {
    this._loading.set(true);
    this.http.get<Subcontract[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (subcontracts) => {
          this._subcontracts.set(subcontracts);
          this._error.set(null);
        },
        error: () => {
          this._error.set('Failed to load subcontracts');
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new subcontract record
   * @param subcontract Subcontract data (without id, timestamps and version)
   * @returns Observable with the created subcontract object
   * @throws Error when validation fails or server error occurs
   */
  addSubcontract(subcontract: Omit<Subcontract, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Subcontract> {
    return this.http.post<Subcontract>(this.apiUrl, subcontract, this.httpOptions).pipe(
      tap({
        next: (newSubcontract) => {
          this._subcontracts.update(subcontracts => [...subcontracts, newSubcontract]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add subcontract');
          console.error('Error adding subcontract:', err);
          return of(subcontract);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all subcontracts
   * @returns Observable with subcontract array
   * @throws Error when server request fails
   */
  getAllSubcontracts(): Observable<Subcontract[]> {
    return this.http.get<Subcontract[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch subcontracts');
        console.error('Error fetching subcontracts:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single subcontract by ID
   * @param id Subcontract identifier
   * @returns Observable with Subcontract object
   * @throws Error when subcontract not found or server error occurs
   */
  getSubcontractById(id: number): Observable<Subcontract | undefined> {
    return this.http.get<Subcontract>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch subcontract by id');
        console.error(err);
        return of(undefined as unknown as Subcontract);
      })
    );
  }

  /**
   * Retrieves all subcontracts given a customer
   * @param customerId Customer to get his subcontracts
   * @returns Observable with Subcontract array
   * @throws Error when server request fails
   */
  getAllSubcontractsByCustomerId(customerId: number): Observable<Subcontract[]> {
    return this.http.get<Subcontract[]>(`${this.apiUrl}/customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch subcontracts');
        console.error('Error fetching subcontracts:', err);
        return of([]);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing subcontract
   * @param id Subcontract identifier to update
   * @param subcontract Partial subcontract data with updates
   * @returns Observable with updated Subcontract object
   * @throws Error when subcontract not found or validation fails
   */
  updateSubcontract(updatedSubcontract: Subcontract): Observable<Subcontract> {
    const url = `${this.apiUrl}/${updatedSubcontract.id}`;
    return this.http.put<Subcontract>(url, updatedSubcontract, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._subcontracts.update(subcontracts =>
            subcontracts.map(s => s.id === res.id ? res : s)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update subcontract');
          console.error('Error updating subcontract:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a subcontract record
   * @param id Subcontract identifier to delete
   * @returns Empty Observable
   * @throws Error when subcontract not found or server error occurs
   */
  deleteSubcontract(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._subcontracts.update(subcontracts =>
            subcontracts.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete subcontract');
        }
      })
    )
  }

  /**
  * Cleans the state of the subcontracts
  */
  clearSubcontracts(): void {
    this._subcontracts.set([]);
    this._error.set(null);
  }

  updateSubcontractData(subcontracts: Subcontract[]) {
    this._subcontracts.set(subcontracts)
  }
}