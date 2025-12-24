import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { OrderEmployeeService } from '../../../Services/order-employee.service';
import { OrderEmployee } from '../../../Entities/orderEmployee';

/**
 * Utility class for project employee business logic and operations.
 * Works with ProjectEmployeeService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class OrderEmployeeUtils {
  private readonly orderEmployeeService = inject(OrderEmployeeService);

  /**
   * Gets all project period by project
   */
  getAllOrderEmployeeByProject(projectId: number): Observable<OrderEmployee[]> {
    return this.orderEmployeeService.getAllOrderEmployeeByProject(projectId);
  }

}