import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { OrderCommission } from '../Entities/orderCommission';

@Injectable({
  providedIn: 'root'
})
export class OrderCommissionService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/ordercommissions`;
  //Signals
  private readonly _orderCommissions = signal<OrderCommission[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public orderCommissions = this._orderCommissions.asReadonly();
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
   * Creates a new order commission record
   * @param orderCommission order commission data (without id, timestamps and version)
   * @returns Observable with the created order commission object
   * @throws Error when validation fails or server error occurs
   */
  addOrderCommission(orderCommission: Omit<OrderCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<OrderCommission> {
    return this.http.post<OrderCommission>(this.apiUrl, orderCommission, this.httpOptions).pipe(
      tap({
        next: (newOrderCommission) => {
          this._orderCommissions.update(orderCommissions => [...orderCommissions, newOrderCommission]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add order commission');
          console.error('Error adding order commission:', err);
          return of(orderCommission);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all order commissions
   * @returns Observable with OrderCommission array
   * @throws Error when server request fails
   */
  getAllOrderCommissions(): Observable<OrderCommission[]> {
    return this.http.get<OrderCommission[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch order commissions');
        console.error('Error fetching order commissions:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single order commission by ID
   * @param id Order Commission identifier
   * @returns Observable with Order Commission object
   * @throws Error when order commission not found or server error occurs
   */
  getOrderCommissionById(id: number): Observable<OrderCommission | undefined> {
    return this.http.get<OrderCommission>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch order commission by id');
        console.error(err);
        return of(undefined as unknown as OrderCommission);
      })
    );
  }

  /**
   * Retrieves all order commissions given a customer
   * @param customerId Customer to get his order commissions
   * @returns Observable with OrderCommission array
   * @throws Error when server request fails
   */
  getAllOrderCommissionsByCustomerId(customerId: number): Observable<OrderCommission[]> {
    return this.http.get<OrderCommission[]>(`${this.apiUrl}/by-customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch order commissions');
        console.error('Error fetching order commissions:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves all order commissions given a order
   * @param orderId Order to get his order commissions
   * @returns Observable with OrderCommission array
   * @throws Error when server request fails
   */
  getAllOrderCommissionsByOrderId(orderId: number): Observable<OrderCommission[]> {
    return this.http.get<OrderCommission[]>(`${this.apiUrl}/by-order/${orderId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch order commissions');
        console.error('Error fetching order commissions:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves all order commissions given a basic contract
   * @param basicContractId Basic Contract to get his order commissions
   * @returns Observable with Order Commission array
   * @throws Error when server request fails
   */
  getAllOrderCommissionsByBasicContractId(basicContractId: number): Observable<OrderCommission[]> {
    return this.http.get<OrderCommission[]>(`${this.apiUrl}/by-basiccontract/${basicContractId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch order commissions');
        console.error('Error fetching order commissions:', err);
        return of([]);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing order commission
   * @param id OrderCommission identifier to update
   * @param orderCommission Partial order commission data with updates
   * @returns Observable with updated OrderCommission object
   * @throws Error when order commission not found or validation fails
   */
  updateOrderCommission(updatedOrderCommission: OrderCommission): Observable<OrderCommission> {
    const url = `${this.apiUrl}/${updatedOrderCommission.id}`;
    return this.http.put<OrderCommission>(url, updatedOrderCommission, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._orderCommissions.update(orderCommissions =>
            orderCommissions.map(s => s.id === res.id ? res : s)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update order commission');
          console.error('Error updating order commission:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a order commission record
   * @param id order commission identifier to delete
   * @returns Empty Observable
   * @throws Error when order commission not found or server error occurs
   */
  deleteOrderCommission(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._orderCommissions.update(orderCommissions =>
            orderCommissions.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete order commission');
        }
      })
    )
  }

  /**
  * Cleans the state of the order commissions
  */
  clearOrderCommissions(): void {
    this._orderCommissions.set([]);
    this._error.set(null);
  }

  updateOrderCommissionData(orderCommissions: OrderCommission[]) {
    this._orderCommissions.set(orderCommissions)
  }
} 