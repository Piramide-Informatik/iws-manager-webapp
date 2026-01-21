import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { Employee } from '../Entities/employee';
import { catchError, Observable, of, tap } from 'rxjs';
import { EmployeeFullNameDTO } from '../Entities/employeeFullNameDTO';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV_V2}/employees`;
  //Signals
  private readonly _employees = signal<Employee[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public employees = this._employees.asReadonly();
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

  public loadInitialData(): void {
    this._loading.set(true);
    this.http.get<Employee[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (employees) => {
          this._employees.set(employees);
          this._error.set(null);
        },
        error: () => {
          this._error.set('Failed to load employees');
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new employee record
   * @param employee Employee data (without id, timestamps and version)
   * @returns Observable with the created Employee object
   * @throws Error when validation fails or server error occurs
   */
  addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Employee> {
    return this.http.post<Employee>(this.apiUrl, employee, this.httpOptions).pipe(
      tap({
        next: (newEmployee) => {
          this._employees.update(employees => [...employees, newEmployee]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add employee');
          console.error('Error adding employee:', err);
          return of(employee);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all employees
   * @returns Observable with Employee array
   * @throws Error when server request fails
   */
  getAllEmployees(): Observable<Employee[]> {
    return this.http.get<Employee[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employees');
        console.error('Error fetching employees:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single employee by ID
   * @param id Employee identifier
   * @returns Observable with Employee object
   * @throws Error when employee not found or server error occurs
   */
  getEmployeeById(id: number): Observable<Employee | undefined> {
    return this.http.get<Employee>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employee by id');
        console.error(err);
        return of(undefined as unknown as Employee);
      })
    );
  }

  /**
   * Retrieves all employees given a customer
   * @param customerId Customer to get his employees
   * @returns Observable with Employee array
   * @throws Error when server request fails
   */
  getAllEmployeesByCustomerId(customerId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employees');
        console.error('Error fetching employees:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves all employees with full name given a customer sorted by full name
   * @param customerId Customer to get his employees
   * @returns Observable with EmployeeFullNameDTO array
   * @throws Error when server request fails
   */
  getAllEmployeesSortedByFullNameByCustomerId(customerId: number): Observable<EmployeeFullNameDTO[]> {
    return this.http.get<EmployeeFullNameDTO[]>(`${this.apiUrl}/customer/${customerId}/sort-by-fullname`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employees');
        console.error('Error fetching employees:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves all employees given a project id
   * @param projectId Project to get his employees
   * @returns Observable with Employee array
   * @throws Error when server request fails
   */
  getAllEmployeesByProjectId(projectId: number): Observable<Employee[]> {
    return this.http.get<Employee[]>(`${this.apiUrl}/project/${projectId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employees');
        console.error('Error fetching employees:', err);
        return of([]);
      })
    );
  }

  getNextEmployeeNumber(customerId: number): Observable<number | null> {
    return this.http.get<number>(`${this.apiUrl}/customer/${customerId}/next-employeeno`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch employee number');
        console.error(err);
        return of(null);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing employee
   * @param id Employee identifier to update
   * @param employee Partial employee data with updates
   * @returns Observable with updated Employee object
   * @throws Error when employee not found or validation fails
   */
  updateEmployee(updatedEmployee: Employee): Observable<Employee> {
    const url = `${this.apiUrl}/${updatedEmployee.id}`;
    return this.http.put<Employee>(url, updatedEmployee, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._employees.update(employees =>
            employees.map(e => e.id === res.id ? res : e)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update employee');
          console.error('Error updating employee:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a employee record
   * @param id Employee identifier to delete
   * @returns Empty Observable
   * @throws Error when employee not found or server error occurs
   */
  deleteEmployee(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._employees.update(employees =>
            employees.filter(e => e.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete employee');
        }
      })
    )
  }

  /**
  * Cleans the state of the employees
  */
  clearEmployees(): void {
    this._employees.set([]);
    this._error.set(null);
  }

  updateEmployeeData(employees: Employee[]) {
    this._employees.set(employees)
  }
}