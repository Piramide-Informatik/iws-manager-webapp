import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, map, Observable, of, tap, throwError } from 'rxjs';
import { OrderEmployee } from '../Entities/orderEmployee';

@Injectable({
  providedIn: 'root'
})
export class OrderEmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV_V2}/order-employees`;

  // Signals
  private readonly _orderEmployees = signal<OrderEmployee[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public orderEmployees = this._orderEmployees.asReadonly();
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
   * Creates a new order employee
   * @param orderEmployee Order employee (without id, timestamps and version)
   * @returns Observable with the created order employee
   * @throws Error when validation fails or server error occurs
   */
  addOrderEmployee(orderEmployee: Omit<OrderEmployee, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<OrderEmployee> {
    this._loading.set(true);

    return this.http.post<OrderEmployee>(this.apiUrl, orderEmployee, this.httpOptions).pipe(
      tap({
        next: (newOrderEmployee) => {
          this._error.set(null);
          this._loading.set(false);
          this._orderEmployees.update(employees => [...employees, newOrderEmployee]);
        },
        error: (err) => {
          this._error.set('Failed to add order employee');
          this._loading.set(false);
          console.error('Error adding order employee:', err);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all order employees
   * @returns Observable with all order employees
   * @throws Error when server request fails
   */
  getAllOrderEmployees(): Observable<OrderEmployee[]> {
    this._loading.set(true);

    return this.http.get<OrderEmployee[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single order employee by ID
   * @param id Order employee identifier
   * @returns Observable with Order employee object
   * @throws Error when order employee not found or server error occurs
   */
  getOrderEmployeeById(id: number): Observable<OrderEmployee> {
    this._loading.set(true);

    return this.http.get<OrderEmployee>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._loading.set(false);
        return of(undefined as unknown as OrderEmployee);
      })
    );
  }

  /**
   * Filters order employees by project ID (client-side filtering)
   * @param projectId Project identifier
   * @returns Observable with filtered order employees
   */
  getAllOrderEmployeeByProject(projectId: number): Observable<OrderEmployee[]> {
    this._loading.set(true);

    return this.http.get<OrderEmployee[]>(`${this.apiUrl}/project/${projectId}`, this.httpOptions).pipe(
      tap({
        next: (orderEmployees) => {
          this._error.set(null);
          this._loading.set(false);
          this._orderEmployees.set(orderEmployees);
        },
        error: (err) => {
          this._error.set('Failed to fetch order employees');
          this._loading.set(false);
          console.error('Error fetching order employees:', err);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Filters order employees by employee ID (client-side filtering)
   * @param employeeId Employee identifier
   * @returns Observable with filtered order employees
   */
  getOrderEmployeesByEmployee(employeeId: number): Observable<OrderEmployee[]> {
    this._loading.set(true);

    return this.getAllOrderEmployees().pipe(
      tap(() => this._loading.set(false)),
      map(orderEmployees => orderEmployees.filter(oe =>
        oe.employee?.id === employeeId
      )),
      catchError(err => {
        this._loading.set(false);
        return of([]);
      })
    );
  }

  /**
   * Checks if an order employee already exists for the given employee and order (client-side)
   * @param employeeId Employee identifier
   * @param orderId Order identifier
   * @returns Observable with boolean indicating existence
   */
  checkOrderEmployeeExists(employeeId: number, orderId: number): Observable<boolean> {
    return this.getAllOrderEmployees().pipe(
      map(orderEmployees =>
        orderEmployees.some(oe =>
          oe.employee?.id === employeeId && oe.order?.id === orderId
        )
      ),
      catchError(err => {
        console.error('Error checking order employee existence:', err);
        return of(false);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing order employee
   * @param updatedOrderEmployee Order employee data with updates
   * @returns Observable with updated Order employee object
   * @throws Error when order employee not found or validation fails
   */
  updateOrderEmployee(updatedOrderEmployee: OrderEmployee): Observable<OrderEmployee> {
    this._loading.set(true);
    const url = `${this.apiUrl}/${updatedOrderEmployee.id}`;

    return this.http.put<OrderEmployee>(url, updatedOrderEmployee, this.httpOptions).pipe(
      tap({
        next: (updated) => {
          this._error.set(null);
          this._loading.set(false);
          // Update local state
          this._orderEmployees.update(employees =>
            employees.map(emp => emp.id === updated.id ? updated : emp)
          );
        },
        error: (err) => {
          this._error.set('Failed to update order employee');
          this._loading.set(false);
          console.error('Error updating order employee:', err);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Delete an order employee
   * @param id Order employee id
   * @returns Observable that completes when deletion is done
   * @throws Error when validation fails or server error occurs
   */
  deleteOrderEmployee(id: number): Observable<void> {
    this._loading.set(true);
    const url = `${this.apiUrl}/${id}`;

    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._orderEmployees.update(employees =>
            employees.filter(emp => emp.id !== id)
          );
          this._error.set(null);
          this._loading.set(false);
        },
        error: (err) => {
          this._error.set('Failed to delete order employee');
          this._loading.set(false);
          console.error('Error deleting order employee:', err);
        }
      }),
      catchError(err => {
        this._loading.set(false);
        return throwError(() => err);
      })
    );
  }

  /**
   * Clears the state of the order employees
   */
  clearOrderEmployees(): void {
    this._orderEmployees.set([]);
    this._error.set(null);
    this._loading.set(false);
  }

  /**
   * Loads initial data for order employees
   */
  loadInitialData(): void {
    this.getAllOrderEmployees().subscribe();
  }

  /**
   * Refreshes the order employees data
   */
  refreshOrderEmployees(): void {
    this.loadInitialData();
  }
}