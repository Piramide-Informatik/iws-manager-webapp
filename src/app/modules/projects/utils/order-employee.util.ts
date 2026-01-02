import { Injectable, inject } from '@angular/core';
import { Observable, switchMap, take, throwError } from 'rxjs';
import { OrderEmployeeService } from '../../../Services/order-employee.service';
import { OrderEmployee } from '../../../Entities/orderEmployee';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../shared/utils/occ-error';

/**
 * Utility class for order employee business logic and operations.
 * Works with OrderEmployeeService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class OrderEmployeeUtils {
  private readonly orderEmployeeService = inject(OrderEmployeeService);

  /**
   * Gets all order employees by project
   * @param projectId - Project ID to get order employees for
   * @returns Observable with array of order employees
   */
  getAllOrderEmployeeByProject(projectId: number): Observable<OrderEmployee[]> {
    return this.orderEmployeeService.getAllOrderEmployeeByProject(projectId);
  }

  /**
   * Gets all order employees
   * @returns Observable with array of all order employees
   */
  getAllOrderEmployees(): Observable<OrderEmployee[]> {
    return this.orderEmployeeService.getAllOrderEmployees();
  }

  /**
   * Creates a new order employee with validation
   * @param orderEmployee - Order employee object to create (without id, timestamps, version)
   * @returns Observable with the created order employee
   */
  addOrderEmployee(orderEmployee: Omit<OrderEmployee, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<OrderEmployee> {
    // Check for duplicates before creating
    return this.orderEmployeeService.addOrderEmployee(orderEmployee);
  }

  /**
   * Updates an order employee with version control and OCC error handling
   * @param orderEmployee - Order employee object with updated data
   * @returns Observable with the updated order employee
   */
  updateOrderEmployee(orderEmployee: OrderEmployee): Observable<OrderEmployee> {
    if (!orderEmployee.id) {
      return throwError(() => new Error('Invalid order employee data'));
    }

    return this.orderEmployeeService.getOrderEmployeeById(orderEmployee.id).pipe(
      take(1),
      switchMap((currentOrderEmployee) => {
        if (!currentOrderEmployee) {
          return throwError(() => createNotFoundUpdateError('Order Employee'));
        }

        if (currentOrderEmployee.version !== orderEmployee.version) {
          return throwError(() => createUpdateConflictError('Order Employee'));
        }

        return this.orderEmployeeService.updateOrderEmployee(orderEmployee);
      })
    );
  }

  /**
   * Deletes an order employee
   * @param id - ID of the order employee to delete
   * @returns Observable that completes when deletion is done
   */
  deleteOrderEmployee(id: number): Observable<void> {
    return this.orderEmployeeService.deleteOrderEmployee(id);
  }

  /**
   * Gets an order employee by ID with proper error handling
   * @param id - ID of the order employee to retrieve
   * @returns Observable with the order employee
   */
  getOrderEmployeeById(id: number): Observable<OrderEmployee> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid order employee ID'));
    }

    return this.orderEmployeeService.getOrderEmployeeById(id);
  }

  /**
   * Checks if an order employee already exists
   * @param employeeId - Employee ID to check
   * @param orderId - Order ID to check
   * @returns Observable with boolean indicating existence
   */
  orderEmployeeExists(employeeId: number, orderId: number): Observable<boolean> {
    return this.orderEmployeeService.checkOrderEmployeeExists(employeeId, orderId);
  }

  /**
   * Gets order employees by employee ID
   * @param employeeId - Employee ID to filter by
   * @returns Observable with array of order employees for the employee
   */
  getOrderEmployeesByEmployee(employeeId: number): Observable<OrderEmployee[]> {
    return this.orderEmployeeService.getOrderEmployeesByEmployee(employeeId);
  }

  /**
   * Refreshes order employees data
   * @returns Observable that completes when refresh is done
   */
  refreshOrderEmployees(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.orderEmployeeService.refreshOrderEmployees();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Clears the order employees state
   */
  clearOrderEmployees(): void {
    this.orderEmployeeService.clearOrderEmployees();
  }
}