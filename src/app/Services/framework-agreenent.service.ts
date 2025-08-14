import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { FrameworkAgreements } from '../Entities/Framework-agreements';

@Injectable({
  providedIn: 'root'
})
export class FrameworkAgreementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/framework-agreements`;
  //Signals
  private readonly _frameworkAgreements = signal<FrameworkAgreements[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public frameworkAgreements = this._frameworkAgreements.asReadonly();
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
   * Creates a new framework agreement record
   * @param frameworkAgreement Framework Agreement data (without id, timestamps and version)
   * @returns Observable with the created Framework Agreement object
   * @throws Error when validation fails or server error occurs
   */
  addFrameworkAgreement(frameworkAgreement: Omit<FrameworkAgreements, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<FrameworkAgreements> {
    return this.http.post<FrameworkAgreements>(this.apiUrl, frameworkAgreement, this.httpOptions).pipe(
      tap({
        next: (newFrameworkAgreement) => {
          this._frameworkAgreements.update(frameworkAgreements => [...frameworkAgreements, newFrameworkAgreement]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add framework Agreement');
          console.error('Error adding framework Agreement:', err);
          return of(frameworkAgreement);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all frameworkAgreements
   * @returns Observable with FrameworkAgreements array
   * @throws Error when server request fails
   */
  getAllFrameworkAgreements(): Observable<FrameworkAgreements[]> {
    return this.http.get<FrameworkAgreements[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch framework agreements');
        console.error('Error fetching framework agreements:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single framework agreement by ID
   * @param id Framework Agreement identifier
   * @returns Observable with Framework Agreement object
   * @throws Error when framework agreements not found or server error occurs
   */
  getFrameworkAgreementById(id: number): Observable<FrameworkAgreements | undefined> {
    return this.http.get<FrameworkAgreements>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch framework agreements by id');
        console.error(err);
        return of(undefined as unknown as FrameworkAgreements);
      })
    );
  }

  /**
   * Retrieves all framework agreements given a customer
   * @param customerId Customer to get his framework agreements
   * @returns Observable with Framework Agreement array
   * @throws Error when server request fails
   */
  getAllFrameworkAgreementsByCustomerId(customerId: number): Observable<FrameworkAgreements[]> {
    return this.http.get<FrameworkAgreements[]>(`${this.apiUrl}/customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch framework agreements');
        console.error('Error fetching framework agreements:', err);
        return of([]);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing Framework Agreement
   * @param id Framework Agreement identifier to update
   * @param frameworkAgreement Partial framework agreements data with updates
   * @returns Observable with updated Framework Agreement object
   * @throws Error when framework agreement not found or validation fails
   */
  updateFrameworkAgreements(updatedFrameworkAgreements: FrameworkAgreements): Observable<FrameworkAgreements> {
    const url = `${this.apiUrl}/${updatedFrameworkAgreements.id}`;
    return this.http.put<FrameworkAgreements>(url, updatedFrameworkAgreements, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._frameworkAgreements.update(frameworkAgreements =>
            frameworkAgreements.map(e => e.id === res.id ? res : e)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update framework agreements');
          console.error('Error updating framework agreements:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a framework agreement record
   * @param id Framework Agreement identifier to delete
   * @returns Empty Observable
   * @throws Error when framework agreements not found or server error occurs
   */
  deleteFrameworkAgreements(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._frameworkAgreements.update(frameworkAgreements =>
            frameworkAgreements.filter(e => e.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete framework agreement');
        }
      })
    )
  }

  /**
  * Cleans the state of the framework agreements
  */
  clearFrameworkAgreements(): void {
    this._frameworkAgreements.set([]);
    this._error.set(null);
  }

  updateFrameworkAgreementsData(frameworkAgreements: FrameworkAgreements[]) {
    this._frameworkAgreements.set(frameworkAgreements)
  }
}