import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { ContractOrderCommission } from '../Entities/contractOrderCommission';


@Injectable({
  providedIn: 'root'
})
export class ContractOrderCommissionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV_V2}/contract-order-commissions`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };


  private readonly _contractOrderCommissions = signal<ContractOrderCommission[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);


  public contractOrderCommissions = this._contractOrderCommissions.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<ContractOrderCommission[]> {
    this._loading.set(true);
    return this.http.get<ContractOrderCommission[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (contractOrderCommissions) => {
          this._contractOrderCommissions.set(contractOrderCommissions);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load contract order commissions');
          console.error('Error loading contract order commissions:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addContractOrderCommission(contractOrderCommission: Omit<ContractOrderCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ContractOrderCommission> {
    return this.http.post<ContractOrderCommission>(this.apiUrl, contractOrderCommission, this.httpOptions).pipe(
      tap({
        next: (newContractOrderCommission) => {
          this._contractOrderCommissions.update(contractOrderCommissions => [...contractOrderCommissions, newContractOrderCommission]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add contract order commission');
          console.error('Error adding contract order commission:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updateContractOrderCommission(updatedContractOrderCommission: ContractOrderCommission): Observable<ContractOrderCommission> {
    const url = `${this.apiUrl}/${updatedContractOrderCommission.id}`;
    return this.http.put<ContractOrderCommission>(url, updatedContractOrderCommission, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._contractOrderCommissions.update(contractOrderCommissions =>
            contractOrderCommissions.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update contract order commission');
          console.error('Error updating contract order commission:', err);
        }
      })
    );
  }

  // DELETE
  deleteContractOrderCommission(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._contractOrderCommissions.update(contractOrderCommissions =>
            contractOrderCommissions.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete contract order commission');
          console.error('Error deleting contract order commission:', err);
        }
      })
    );
  }

  // READ
  getAllContractOrderCommissions(): Observable<ContractOrderCommission[]> {
    return this.http.get<ContractOrderCommission[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch contract order commissions');
        console.error('Error fetching contract order commissions:', err);
        return of([]);
      })
    );
  }

  getContractOrderCommissionById(id: number): Observable<ContractOrderCommission | undefined> {
    return this.http.get<ContractOrderCommission>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch contract order commissions');
        console.error('Error fetching contract order commissions:', err);
        return of(undefined);
      })
    );
  }

  getContractOrderCommissionsByBasicContractId(basicContractId: number): Observable<ContractOrderCommission[]> {
    return this.http.get<ContractOrderCommission[]>(`${this.apiUrl}/by-basic-contract/${basicContractId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch contract order commissions by basic contract ID');
        console.error('Error fetching contract order commissions by basic contract ID:', err);
        return of([]);
      })
    );
  }

  getContractOrderCommissionsByBasicContractIdSortedByFromOrderValue(basicContractId: number): Observable<ContractOrderCommission[]> {
    return this.http.get<ContractOrderCommission[]>(`${this.apiUrl}/by-basic-contract/${basicContractId}/sort-by-from-order-value`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch contract order commissions sorted by from order value');
        console.error('Error fetching contract order commissions sorted by from order value:', err);
        return of([]);
      })
    );
  }

  public refreshContractOrderCommissions(): void {
    this.loadInitialData();
  }
}