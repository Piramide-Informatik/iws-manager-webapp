import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, of } from 'rxjs';
import { CostTypeService } from '../../../../../Services/cost-type.service';
import { CostType } from '../../../../../Entities/costType';
import { OrderUtils } from '../../../../orders/utils/order-utils';

/**
 * Utility class for costType-related business logic and operations.
 * Works with CostTypeService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class CostTypeUtils {
  private readonly costTypeService = inject(CostTypeService);
  private readonly orderUtils = inject(OrderUtils);

  loadInitialData(): Observable<CostType[]> {
    return this.costTypeService.loadInitialData();
  }

  /**
   * Gets a costType by ID with proper error handling
   * @param id - ID of the costType to retrieve
   * @returns Observable emitting the costType or undefined if not found
   */
  getCostTypeById(id: number): Observable<CostType | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid costType ID'));
    }

    return this.costTypeService.getCostTypeById(id).pipe(
      catchError(err => {
        console.error('Error fetching costType:', err);
        return throwError(() => new Error('Failed to load costType'));
      })
    );
  }

  /**
   * Creates a new costType with validation
   * @param nameCostType - Name for the new costType
   * @returns Observable that completes when costType is created
   */

  addCostType(costType: Omit<CostType, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<CostType> {
    return this.costTypeService.addCostType(costType);
  }


  getAllCostTypes(): Observable<CostType[]> {
    return this.costTypeService.getAllCostTypes();
  }

  /**
     * Refreshes customers data
     * @returns Observable that completes when refresh is done
     */
  refreshCostTypes(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.costTypeService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a costType by ID and updates the internal costTypes signal.
 * @param id - ID of the costType to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteCostType(id: number): Observable<void> {
    return this.checkCostTypeUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.costTypeService.deleteCostType(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a costType is used by any order.
   * @param idCostType - ID of the costType to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkCostTypeUsage(idCostType: number): Observable<boolean> {
    return this.orderUtils.getAllOrders().pipe(
        map(orders => orders.some(order => order.orderType?.id === idCostType)),
        catchError(() => of(false))
    );
  }

  /**
 * Updates a costType by ID and updates the internal costTypes signal.
 * @param id - ID of the costType to update
 * @returns Observable that completes when the update is done
 */
  updateCostType(costType: CostType): Observable<CostType> {
    if (!costType?.id) {
      return throwError(() => new Error('Invalid costType data'));
    }

    return this.costTypeService.getCostTypeById(costType.id).pipe(
      take(1),
      map((currentCostType) => {
        if (!currentCostType) {
          throw new Error('CostType not found');
        }
        if (currentCostType.version !== costType.version) {
          throw new Error('Version conflict: CostType has been updated by another user');
        }
        return costType;
      }),
      switchMap((validatedCostType: CostType) => this.costTypeService.updateCostType(validatedCostType)),
      catchError((err) => {
        console.error('Error updating costType:', err);
        return throwError(() => err);
      })
    );
  }
}