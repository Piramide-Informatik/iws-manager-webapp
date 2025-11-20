import { inject, Injectable } from '@angular/core';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';
import { OrderCommissionService } from '../../../../../Services/order-commission.service';
import { OrderCommission } from '../../../../../Entities/orderCommission';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for order commissions-related business logic and operations.
 * Works with OrderCommission Service's reactive signals while providing additional functionality.
 */
export class OrderCommissionUtils {
  private readonly orderCommissionService = inject(OrderCommissionService);

  /**
  * Gets all order commissions without any transformation
  * @returns Observable emitting the raw list of order commissions
  */
  getAllOrderCommissions(): Observable<OrderCommission[]> {
    return this.orderCommissionService.getAllOrderCommissions().pipe(
      catchError(() => throwError(() => new Error('Failed to load order commissions')))
    );
  }
 
  /**
  * Gets a orderCommission by ID with proper error handling
  * @param id - ID of the orderCommission to retrieve
  * @returns Observable emitting the orderCommission or undefined if not found
  */
  getOrderCommissionById(id: number): Observable<OrderCommission | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid orderCommission ID'));
    }

    return this.orderCommissionService.getOrderCommissionById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load orderCommission'));
      })
    );
  }

  /**
  * Gets all order commissions given a customer
  * @param customerId - Customer to get his order commissions
  * @returns Observable emitting the raw list of order commissions
  */
  getAllOrderCommissionByCustomerId(customerId: number): Observable<OrderCommission[]> {
    return this.orderCommissionService.getAllOrderCommissionsByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load order commissions')))
    );
  }

  /**
  * Gets all order commissions given a order
  * @param orderId - Order to get his order commissions
  * @returns Observable emitting the raw list of order commissions
  */
  getAllOrderCommissionByOrderId(orderId: number): Observable<OrderCommission[]> {
    return this.orderCommissionService.getAllOrderCommissionsByOrderId(orderId).pipe(
      catchError(() => throwError(() => new Error('Failed to load order commissions')))
    );
  }

  /**
  * Creates a new orderCommission with validation
  * @param orderCommission - OrderCommission object to create (without id)
  * @returns Observable that completes when orderCommission is created
  */
  createOrderCommission(orderCommission: Omit<OrderCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<OrderCommission> {
    return this.orderCommissionService.addOrderCommission(orderCommission);
  }

  /**
  * Deletes a orderCommission by ID and updates the internal order commissions signal.
  * @param id - ID of the orderCommission to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteOrderCommission(id: number): Observable<void> {
    return this.orderCommissionService.deleteOrderCommission(id).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
  * Updates a orderCommission by ID and updates the internal order commissions signal.
  * @param orderCommission - OrderCommission object with updated data
  * @returns Observable that completes when the update is done
  */
  updateOrderCommission(orderCommission: OrderCommission): Observable<OrderCommission> {
    if (!orderCommission.id) {
      return throwError(() => new Error('Invalid orderCommission data'));
    }

    return this.orderCommissionService.getOrderCommissionById(orderCommission.id).pipe(
      take(1),
      switchMap((currentOrderCommission) => {
        if (!currentOrderCommission) {
          return throwError(() => createNotFoundUpdateError('Order Commission'));
        }

        if (currentOrderCommission.version !== orderCommission.version) {
          return throwError(() => createUpdateConflictError('Order'));
        }

        return this.orderCommissionService.updateOrderCommission(orderCommission);
      })
    );
  }

  /**Get all by Order Id sorted by fromOrderValue */
  getAllOrderCommissionsByOrderIdSortedByFromOrderValue(orderId: number): Observable<OrderCommission[]> {
    return this.orderCommissionService.getAllOrderCommissionsByOrderIdSortedByFromOrderValue(orderId).pipe(
      catchError(() => throwError(() => new Error('Failed to load order commissions')))
    );
  }
}