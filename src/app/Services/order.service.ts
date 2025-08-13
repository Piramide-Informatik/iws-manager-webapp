import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { Order } from '../Entities/order';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/orders`;
  //Signals
  private readonly _orders = signal<Order[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public orders = this._orders.asReadonly();
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
   * Creates a new order record
   * @param order order data (without id, timestamps and version)
   * @returns Observable with the created order object
   * @throws Error when validation fails or server error occurs
   */
  addOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Order> {
    return this.http.post<Order>(this.apiUrl, order, this.httpOptions).pipe(
      tap({
        next: (newOrder) => {
          this._orders.update(orders => [...orders, newOrder]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add order');
          console.error('Error adding order:', err);
          return of(order);
        }
      })
    );
  }

  /**
   * Retrieves a single order by ID
   * @param id Order identifier
   * @returns Observable with Order object
   * @throws Error when order not found or server error occurs
   */
  getOrderById(id: number): Observable<Order | undefined> {
    return this.http.get<Order>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch order by id');
        console.error(err);
        return of(undefined as unknown as Order);
      })
    );
  }

  /**
   * Retrieves all orders given a customer
   * @param customerId Customer to get his orders
   * @returns Observable with Order array
   * @throws Error when server request fails
   */
  getAllOrdersByCustomerId(customerId: number): Observable<Order[]> {
    return this.http.get<Order[]>(`${this.apiUrl}/by-customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch orders');
        console.error('Error fetching orders:', err);
        return of([]);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing order
   * @param id Order identifier to update
   * @param order Partial order data with updates
   * @returns Observable with updated Order object
   * @throws Error when order not found or validation fails
   */
  updateOrder(updatedOrder: Order): Observable<Order> {
    const url = `${this.apiUrl}/${updatedOrder.id}`;
    return this.http.put<Order>(url, updatedOrder, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._orders.update(orders =>
            orders.map(s => s.id === res.id ? res : s)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update order');
          console.error('Error updating order:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a order record
   * @param id order identifier to delete
   * @returns Empty Observable
   * @throws Error when order not found or server error occurs
   */
  deleteOrder(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._orders.update(orders =>
            orders.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete order');
        }
      })
    )
  }

  /**
  * Cleans the state of the orders
  */
  clearOrders(): void {
    this._orders.set([]);
    this._error.set(null);
  }

  updateOrderData(orders: Order[]) {
    this._orders.set(orders)
  }
} 