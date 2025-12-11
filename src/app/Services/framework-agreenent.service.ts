import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { BasicContract } from '../Entities/basicContract';
import { momentCreateDate } from '../modules/shared/utils/moment-date-utils';

@Injectable({
  providedIn: 'root'
})
export class FrameworkAgreementService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/basiccontracts`;
  //Signals
  private readonly _frameworkAgreements = signal<BasicContract[]>([]);
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
   * Creates a new basic contract record
   * @param frameworkAgreement basic contractdata (without id, timestamps and version)
   * @returns Observable with the created basic contractobject
   * @throws Error when validation fails or server error occurs
   */
  addFrameworkAgreement(frameworkAgreement: Omit<BasicContract, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<BasicContract> {
    return this.http.post<BasicContract>(this.apiUrl, frameworkAgreement, this.httpOptions).pipe(
      tap({
        next: (newFrameworkAgreement) => {
          newFrameworkAgreement.date = momentCreateDate(newFrameworkAgreement.date)
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
   * Retrieves all basic contracts
   * @returns Observable with BasicContract array
   * @throws Error when server request fails
   */
  getAllFrameworkAgreements(): Observable<BasicContract[]> {
    return this.http.get<BasicContract[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch basic contracts');
        console.error('Error fetching basic contracts:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single basic contract by ID
   * @param id basic contractidentifier
   * @returns Observable with basic contractobject
   * @throws Error when basic contracts not found or server error occurs
   */
  getFrameworkAgreementById(id: number): Observable<BasicContract | undefined> {
    return this.http.get<BasicContract>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch basic contracts by id');
        console.error(err);
        return of(undefined as unknown as BasicContract);
      })
    );
  }

  /**
   * Retrieves all basic contracts given a customer
   * @param customerId Customer to get his basic contracts
   * @returns Observable with basic contract array
   * @throws Error when server request fails
   */
  getAllFrameworkAgreementsByCustomerId(customerId: number): Observable<BasicContract[]> {
    return this.http.get<BasicContract[]>(`${this.apiUrl}/by-customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch basic contracts');
        console.error('Error fetching basic contracts:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves all basic contracts given a customer sorted by contractNo
   * @param customerId Customer to get his basic contracts sorted
   * @returns Observable with basic contract array sorted
   * @throws Error when server request fails
   */
  getAllFrameworkAgreementsByCustomerIdSortedByContractNo(customerId: number): Observable<BasicContract[]> {
    return this.http.get<BasicContract[]>(`${this.apiUrl}/by-customer/${customerId}/ordered-by-contractno`, this.httpOptions).pipe(
      tap({
        next: (frameworks) => {
          for (let i = 0; i < frameworks.length; i++) {
            frameworks[i].date = momentCreateDate(frameworks[i].date)
          }
          this._frameworkAgreements.set(frameworks);
          this._error.set(null);
        }
      }),
      catchError(err => {
        this._error.set('Failed to fetch basic contracts sorted');
        console.error('Error fetching basic contracts sorted:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves the next contract number
   * @returns Observable with the next contract number
   * @throws Error when server request fails
   */
  getNextContractNumber(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/next-contractno`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch next contract number');
        console.error('Error fetching next contract number:', err);
        return of(0);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing Basic Contracts
   * @param id basic contractidentifier to update
   * @param frameworkAgreement Partial basic contracts data with updates
   * @returns Observable with updated basic contractobject
   * @throws Error when basic contract not found or validation fails
   */
  updateFrameworkAgreements(updatedFrameworkAgreements: BasicContract): Observable<BasicContract> {
    const url = `${this.apiUrl}/${updatedFrameworkAgreements.id}`;
    return this.http.put<BasicContract>(url, updatedFrameworkAgreements, this.httpOptions).pipe(
      tap({
        next: (res) => {
          res.date = momentCreateDate(res.date)
          this._frameworkAgreements.update(frameworkAgreements =>
            frameworkAgreements.map(e => e.id === res.id ? res : e)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update basic contracts');
          console.error('Error updating basic contracts:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a basic contract record
   * @param id basic contractidentifier to delete
   * @returns Empty Observable
   * @throws Error when basic contracts not found or server error occurs
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
          this._error.set('Failed to delete basic contract');
        }
      })
    )
  }

  /**
  * Cleans the state of the basic contracts
  */
  clearFrameworkAgreements(): void {
    this._frameworkAgreements.set([]);
    this._error.set(null);
  }

  updateFrameworkAgreementsData(frameworkAgreements: BasicContract[]) {
    this._frameworkAgreements.set(frameworkAgreements)
  }
}