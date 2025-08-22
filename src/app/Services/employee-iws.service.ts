import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { EmployeeIws } from '../Entities/employeeIws';

@Injectable({
  providedIn: 'root'
})
export class EmployeeIwsService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/employeesiws`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };


  private readonly _employeeIws = signal<EmployeeIws[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);


  public employeeIws = this._employeeIws.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<EmployeeIws[]> {
    this._loading.set(true);
    return this.http.get<EmployeeIws[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (employeeIws) => {
          this._employeeIws.set(employeeIws);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load employeeIws');
          console.error('Error loading employeeIws:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addEmployeeIws(employeeIws: Omit<EmployeeIws, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<EmployeeIws> {
    return this.http.post<EmployeeIws>(this.apiUrl, employeeIws, this.httpOptions).pipe(
      tap({
        next: (newEmployeeIws) => {
          this._employeeIws.update(employeeIws => [...employeeIws, newEmployeeIws]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add employeeIws');
          console.error('Error adding employeeIws:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updateEmployeeIws(updatedEmployeeIws: EmployeeIws): Observable<EmployeeIws> {
    const url = `${this.apiUrl}/${updatedEmployeeIws.id}`;
    return this.http.put<EmployeeIws>(url, updatedEmployeeIws, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._employeeIws.update(employeeIws =>
            employeeIws.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update employeeIws');
          console.error('Error updating employeeIws:', err);
        }
      })
    );
  }

  // DELETE
  deleteEmployeeIws(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._employeeIws.update(employeeIws =>
            employeeIws.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete employeeIws');
          console.error('Error deleting employeeIws:', err);
        }
      })
    );
  }

  // READ
  getAllEmployeeIws(): Observable<EmployeeIws[]> {
    return this.http.get<EmployeeIws[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employeeIws');
        console.error('Error fetching employeeIws:', err);
        return of([]);
      })
    );
  }

  getEmployeeIwsById(id: number): Observable<EmployeeIws | undefined> {
    return this.getAllEmployeeIws().pipe(
      map(employeeIws => employeeIws.find(t => t.id === id))
    );
  }

  getAllEmployeeIwsSortedByFirstname(): Observable<EmployeeIws[]> {
    const url = `${this.apiUrl}/by-firstname/ordered-asc`;
    return this.http.get<EmployeeIws[]>(url, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employeeIws');
        console.error('Error fetching employeeIws:', err);
        return of([]);
      })
    );
  }

  public refreshEmployeeIws(): void {
    this.loadInitialData();
  }
}