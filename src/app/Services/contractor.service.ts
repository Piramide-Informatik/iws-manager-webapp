import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { Contractor } from '../Entities/contractor';

@Injectable({
  providedIn: 'root'
})
export class ContractorService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/contractors`;
  //Signals
  private readonly _contractors = signal<Contractor[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public contractors = this._contractors.asReadonly();
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
    this.http.get<Contractor[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (contractors) => {
          this._contractors.set(contractors);
          this._error.set(null);
        },
        error: () => {
          this._error.set('Failed to load contractors');
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new contractor record
   * @param contractor Contractor data (without id, timestamps and version)
   * @returns Observable with the created Contractor object
   * @throws Error when validation fails or server error occurs
   */
  addContractor(contractor: Omit<Contractor, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Contractor> {
    return this.http.post<Contractor>(this.apiUrl, contractor, this.httpOptions).pipe(
      tap({
        next: (newContractor) => {
          this._contractors.update(contractors => [...contractors, newContractor]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add contractor');
          console.error('Error adding contractor:', err);
          return of(contractor);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all contractors
   * @returns Observable with Contractor array
   * @throws Error when server request fails
   */
  getAllContractors(): Observable<Contractor[]> {
    return this.http.get<Contractor[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch contractors');
        console.error('Error fetching contractors:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single contractor by ID
   * @param id Contractor identifier
   * @returns Observable with Contractor object
   * @throws Error when contractor not found or server error occurs
   */
  getContractorById(id: number): Observable<Contractor | undefined> {
    return this.http.get<Contractor>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch contractor by id');
        console.error(err);
        return of(undefined as unknown as Contractor);
      })
    );
  }

  /**
   * Retrieves all contractors given a customer
   * @param customerId Customer to get his contractors
   * @returns Observable with Contractor array
   * @throws Error when server request fails
   */
  getAllContractorsByCustomerId(customerId: number): Observable<Contractor[]> {
    return this.http.get<Contractor[]>(`${this.apiUrl}/customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch contractors');
        console.error('Error fetching contractors:', err);
        return of([]);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing contractor
   * @param contractor Partial contractor data with updates
   * @returns Observable with updated Contractor object
   * @throws Error when contractor not found or validation fails
   */
  updateContractor(updatedContractor: Contractor): Observable<Contractor> {
    const url = `${this.apiUrl}/${updatedContractor.id}`;
    console.log('Updating contractor:', updatedContractor);
    return this.http.put<Contractor>(url, updatedContractor, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._contractors.update(contractors =>
            contractors.map(c => c.id === res.id ? res : c)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update contractor');
          console.error('Error updating contractor:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a contractor record
   * @param id Contractor identifier to delete
   * @returns Empty Observable
   * @throws Error when contractor not found or server error occurs
   */
  deleteContractor(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._contractors.update(contractors =>
            contractors.filter(c => c.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete contractor');
        }
      })
    )
  }

  /**
  * Cleans the state of the contractors
  */
  clearContractors(): void {
    this._contractors.set([]);
    this._error.set(null);
  }

  updateContractorData(contractors: Contractor[]) {
    this._contractors.set(contractors);
  }
}