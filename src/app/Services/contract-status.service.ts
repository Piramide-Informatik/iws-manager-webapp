import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContractStatus } from '../Entities/contractStatus';

@Injectable({
  providedIn: 'root'
})
export class ContractStatusService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/contractstatuses`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };


  private readonly _contractStatuses = signal<ContractStatus[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);


  public contractStatuses = this._contractStatuses.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<ContractStatus[]> {
    this._loading.set(true);
    return this.http.get<ContractStatus[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (contractStatuses) => {
          this._contractStatuses.set(contractStatuses);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load contractStatuses');
          console.error('Error loading contractStatuses:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addContractStatus(contractStatus: Omit<ContractStatus, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ContractStatus> {
    return this.http.post<ContractStatus>(this.apiUrl, contractStatus, this.httpOptions).pipe(
      tap({
        next: (newContractStatus) => {
          this._contractStatuses.update(contractStatuses => [...contractStatuses, newContractStatus]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add contractStatus');
          console.error('Error adding contractStatus:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updateContractStatus(updatedContractStatus: ContractStatus): Observable<ContractStatus> {
    const url = `${this.apiUrl}/${updatedContractStatus.id}`;
    return this.http.put<ContractStatus>(url, updatedContractStatus, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._contractStatuses.update(contractStatuses =>
            contractStatuses.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update contractStatus');
          console.error('Error updating contractStatus:', err);
        }
      })
    );
  }

  // DELETE
  deleteContractStatus(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._contractStatuses.update(contractStatuses =>
            contractStatuses.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete contractStatus');
          console.error('Error deleting contractStatus:', err);
        }
      })
    );
  }

  // READ
  getAllContractStatuses(): Observable<ContractStatus[]> {
    return this.http.get<ContractStatus[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch contractStatuses');
        console.error('Error fetching contractStatuses:', err);
        return of([]);
      })
    );
  }

  getContractStatusById(id: number): Observable<ContractStatus | undefined> {
    return this.getAllContractStatuses().pipe(
      map(contractStatuses => contractStatuses.find(t => t.id === id))
    );
  }

  public refreshContractStatuss(): void {
    this.loadInitialData();
  }
}