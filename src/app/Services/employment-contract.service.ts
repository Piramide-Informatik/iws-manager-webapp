import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { EmploymentContract } from '../Entities/employment-contract';
import { catchError, Observable, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class EmploymentContractService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/employment-contracts`;
  //Signals
  private readonly _contracts = signal<EmploymentContract[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public contracts = this._contracts.asReadonly();
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

  public loadInitialData(): Observable<EmploymentContract[]> {
    this._loading.set(true);
    return this.http.get<EmploymentContract[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (contracts) => {
          this._contracts.set(contracts);
          this._error.set(null);
        },
        error: () => {
          this._error.set('Failed to load employment contracts');
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    )
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new employment contract record
   * @param contract Employment contract data (without id, timestamps and version)
   * @returns Observable with the created EmploymentContract object
   * @throws Error when validation fails or server error occurs
   */
  addEmploymentContract(contract: Omit<EmploymentContract, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<EmploymentContract> {
    return this.http.post<EmploymentContract>(this.apiUrl, contract, this.httpOptions).pipe(
      tap({
        next: (newContract) => {
          this._contracts.update(contracts => [...contracts, newContract]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add employment contract');
          console.error('Error adding employment contract:', err);
          return of(contract);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all employment contracts
   * @returns Observable with EmploymentContract array
   * @throws Error when server request fails
   */
  getAllEmploymentContracts(): Observable<EmploymentContract[]> {
    return this.http.get<EmploymentContract[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employment contracts');
        console.error('Error fetching employment contracts:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single employment contract by ID
   * @param id Employment contract identifier
   * @returns Observable with EmploymentContract object
   * @throws Error when employment contract not found or server error occurs
   */
  getEmploymentContractById(id: number): Observable<EmploymentContract | undefined> {
    return this.http.get<EmploymentContract>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employment contract by id');
        console.error(err);
        return of(undefined as unknown as EmploymentContract);
      })
    );
  }

  /**
   * Retrieves all employment contracts given a customer
   * @param customerId Customer to get his employment contracts
   * @returns Observable with EmploymentContract array
   * @throws Error when server request fails
   */
  getContractsByCustomerId(customerId: number): Observable<EmploymentContract[]> {
    return this.http.get<EmploymentContract[]>(`${this.apiUrl}/customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employment contracts');
        console.error('Error fetching employment contracts:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves all employment contracts given a customer sorted by employeeNo
   * @param customerId Customer to get his employment contracts
   * @returns Observable with EmploymentContract array sorted
   * @throws Error when server request fails
   */
  getContractsByCustomerIdSortedByEmployeeNo(customerId: number): Observable<EmploymentContract[]> {
    return this.http.get<EmploymentContract[]>(`${this.apiUrl}/customer/${customerId}/ordered-by-employeeno-asc`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employment contracts sorted');
        console.error('Error fetching employment contracts sorted:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves all employment contracts for a specific employee
   * @param employeeId Employee ID to get his employment contracts
   * @returns Observable with EmploymentContract array
   * @throws Error when server request fails
   */
  getContractsByEmployeeId(employeeId: number): Observable<EmploymentContract[]> {
    return this.http.get<EmploymentContract[]>(`${this.apiUrl}/employee/${employeeId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employment contracts for employee');
        console.error('Error fetching employment contracts for employee:', err);
        return of([]);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing employment contract
   * @param id Employment contract identifier to update
   * @param contract Partial employment contract data with updates
   * @returns Observable with updated EmploymentContract object
   * @throws Error when employment contract not found or validation fails
   */
  updateEmploymentContract(updatedContract: EmploymentContract): Observable<EmploymentContract> {
    const url = `${this.apiUrl}/${updatedContract.id}`;
    return this.http.put<EmploymentContract>(url, updatedContract, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._contracts.update(contracts =>
            contracts.map(c => c.id === res.id ? res : c)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update employment contract');
          console.error('Error updating employment contract:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes an employment contract record
   * @param id Employment contract identifier to delete
   * @returns Empty Observable
   * @throws Error when employment contract not found or server error occurs
   */
  deleteEmploymentContract(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._contracts.update(contracts =>
            contracts.filter(c => c.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete employment contract');
        }
      })
    )
  }

  // ==================== READ OPERATIONS (Additional Methods) ====================

  /**
   * Retrieves all employment contracts for a specific customer
   * @param customerId The ID of the customer
   * @returns Observable with array of EmploymentContract
   */
  getContractsByCustomer(customerId: number): Observable<EmploymentContract[]> {
    this._loading.set(true);
    return this.http.get<EmploymentContract[]>(`${this.apiUrl}/customer/${customerId}`, this.httpOptions).pipe(
      tap({
        next: (contracts) => {
          this._contracts.set(contracts);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load contracts by customer');
          console.error('Error loading contracts by customer:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  /**
   * Retrieves all employment contracts for a specific employee
   * @param employeeId The ID of the employee
   * @returns Observable with array of EmploymentContract
   */
  getContractsByEmployee(employeeId: number): Observable<EmploymentContract[]> {
    this._loading.set(true);
    return this.http.get<EmploymentContract[]>(`${this.apiUrl}/employee/${employeeId}`, this.httpOptions).pipe(
      tap({
        next: (contracts) => {
          this._contracts.set(contracts);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load contracts by employee');
          console.error('Error loading contracts by employee:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  /**
  * Cleans the state of the employment contracts
  */
  clearContracts(): void {
    this._contracts.set([]);
    this._error.set(null);
  }

  updateContractsData(contracts: EmploymentContract[]) {
    this._contracts.set(contracts)
  }
}
