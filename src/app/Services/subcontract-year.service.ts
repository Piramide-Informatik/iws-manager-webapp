import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { SubcontractYear } from '../Entities/subcontract-year';

@Injectable({
  providedIn: 'root'
})
export class SubcontractYearService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/subcontracts-year`;
  private readonly _subcontractsYear = signal<SubcontractYear[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public subcontractsYear = this._subcontractsYear.asReadonly();
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
   * Creates a new subcontract year record
   * @param subcontractYear Subcontract year data (without id, timestamps and version)
   * @returns Observable with the created subcontract year object
   * @throws Error when validation fails or server error occurs
   */
  addSubcontractYear(subcontractYear: Omit<SubcontractYear, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<SubcontractYear> {
    return this.http.post<SubcontractYear>(this.apiUrl, subcontractYear, this.httpOptions).pipe(
      tap({
        next: (newSubcontractYear) => {
          this._subcontractsYear.update(subcontractsYear => [...subcontractsYear, newSubcontractYear]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add subcontract year');
          console.error('Error adding subcontract year:', err);
          return of(subcontractYear);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all subcontracts years given subcontracts id
   * @param subcontractId Id of the subcontract
   * @returns Observable with subcontract year array
   * @throws Error when server request fails
   */
  getAllSubcontractsYear(subcontractId: number): Observable<SubcontractYear[]> {
    return this.http.get<SubcontractYear[]>(`${this.apiUrl}/subcontract/${subcontractId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch subcontracts year');
        console.error('Error fetching subcontracts years:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single subcontract year by ID
   * @param id Subcontract year identifier
   * @returns Observable with Subcontract year object
   * @throws Error when subcontract not found or server error occurs
   */
  getSubcontractYearById(id: number): Observable<SubcontractYear | undefined> {
    return this.http.get<SubcontractYear>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch subcontract year by id');
        console.error(err);
        return of(undefined as unknown as SubcontractYear);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing subcontract year
   * @param id Subcontract year identifier to update
   * @param subcontract Partial subcontract year data with updates
   * @returns Observable with updated Subcontract object
   * @throws Error when subcontract not found or validation fails
   */
  updateSubcontractYear(updatedSubcontractYear: SubcontractYear): Observable<SubcontractYear> {
    const url = `${this.apiUrl}/${updatedSubcontractYear.id}`;
    return this.http.put<SubcontractYear>(url, updatedSubcontractYear, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._subcontractsYear.update(subcontractsYear =>
            subcontractsYear.map(s => s.id === res.id ? res : s)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update subcontract year');
          console.error('Error updating subcontract year:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a subcontract year record
   * @param id Subcontract year identifier to delete
   * @returns Empty Observable
   * @throws Error when subcontract not found or server error occurs
   */
  deleteSubcontractYear(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._subcontractsYear.update(subcontractsYear =>
            subcontractsYear.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete subcontract year');
        }
      })
    )
  }

  /**
  * Cleans the state of the subcontracts year
  */
  clearSubcontractsYear(): void {
    this._subcontractsYear.set([]);
    this._error.set(null);
  }

  updateSubcontractYearData(subcontractsYear: SubcontractYear[]) {
    this._subcontractsYear.set(subcontractsYear)
  }
} 