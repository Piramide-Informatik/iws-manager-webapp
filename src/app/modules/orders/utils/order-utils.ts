import { inject, Injectable } from '@angular/core';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';
import { OrderService } from '../../../Services/order.service';
import { Order } from '../../../Entities/order';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for orders-related business logic and operations.
 * Works with Order Service's reactive signals while providing additional functionality.
 */
export class OrderUtils {
  private readonly orderService = inject(OrderService);

  /**
  * Gets all orders without any transformation
  * @returns Observable emitting the raw list of orders
  */
  getAllOrders(): Observable<Order[]> {
    return this.orderService.getAllOrders().pipe(
      catchError(() => throwError(() => new Error('Failed to load orders')))
    );
  }
 
  /**
  * Gets a order by ID with proper error handling
  * @param id - ID of the order to retrieve
  * @returns Observable emitting the order or undefined if not found
  */
  getOrderById(id: number): Observable<Order | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid order ID'));
    }

    return this.orderService.getOrderById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load order'));
      })
    );
  }

  /**
  * Gets all orders given a customer
  * @param customerId - Customer to get his orders
  * @returns Observable emitting the raw list of orders
  */
  getAllOrdersByCustomerId(customerId: number): Observable<Order[]> {
    return this.orderService.getAllOrdersByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load orders')))
    );
  }

  /**
  * Gets all orders given a basicContract
  * @param basicContractId - Basic Contract to get his orders
  * @returns Observable emitting the raw list of orders
  */
  getAllOrdersByBasicContract(basicContractId: number): Observable<Order[]> {
    return this.orderService.getAllOrdersByBasicContractId(basicContractId).pipe(
      catchError(() => throwError(() => new Error('Failed to load orders')))
    );
  }

  /**
  * Creates a new order with validation
  * @param order - Order object to create (without id)
  * @returns Observable that completes when order is created
  */
  createOrder(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Order> {
    return this.orderService.addOrder(order);
  }

  /**
  * Deletes a order by ID and updates the internal orders signal.
  * @param id - ID of the order to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteOrder(id: number): Observable<void> {
    return this.orderService.deleteOrder(id).pipe(
      catchError(error => {
        console.log('Error delete order', error)
        return throwError(() => error);
      })
    );
  }

  /**
  * Updates a order by ID and updates the internal orders signal.
  * @param order - Order object with updated data
  * @returns Observable that completes when the update is done
  */
  updateOrder(order: Order): Observable<Order> {
    if (!order.id) {
      return throwError(() => new Error('Invalid order data'));
    }

    return this.orderService.getOrderById(order.id).pipe(
      take(1),
      switchMap((currentOrder) => {
        if (!currentOrder) {
          return throwError(() => new Error('Order not found'));
        }

        if (currentOrder.version !== order.version) {
          return throwError(() => new Error('Conflict detected: order version mismatch'));
        }

        return this.orderService.updateOrder(order);
      })
    );
  }
}