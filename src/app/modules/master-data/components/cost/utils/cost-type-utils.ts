import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap, map } from 'rxjs';
import { CostTypeService } from '../../../../../Services/cost-type.service';
import { CostType } from '../../../../../Entities/costType';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for costType-related business logic and operations.
 * Works with CostTypeService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class CostTypeUtils {
  private readonly costTypeService = inject(CostTypeService);

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
    const type = costType.type?.trim() || '';
    if (!type) {
      return throwError(() => new Error('Cost type is required'));
    }

    return this.costTypeExists(type).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(() => new Error('cost type already exists'));
        }
        return this.costTypeService.addCostType(costType);
      }),
      catchError((err) => {
        if (err.message === 'cost type already exists') {
          return throwError(() => err);
        }
        return throwError(() => new Error('COSTS.ERROR.CREATION_FAILED'));
      })
    );
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
    return this.costTypeService.deleteCostType(id);
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

    const type = costType.type?.trim() || '';
    if (!type) {
      return throwError(() => new Error('Cost type is required'));
    }

    return this.costTypeService.getCostTypeById(costType.id).pipe(
      take(1),
      switchMap((currentCostType) => {
        if (!currentCostType) {
          return throwError(() => createNotFoundUpdateError('Cost Type'));
        }
        if (currentCostType.version !== costType.version) {
          return throwError(() => createUpdateConflictError('Cost Type'));
        }
        
        return this.costTypeExists(type, costType.id).pipe(
          switchMap((exists) => {
            if (exists) {
              return throwError(() => new Error('cost type already exists'));
            }
            return this.costTypeService.updateCostType(costType);
          })
        );
      }),
      catchError((err) => {
        console.error('Error updating costType:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * NEW: Checks if a cost type already exists (case-insensitive comparison)
   * @param type - Type to check
   * @param excludeId - ID to exclude from check (for updates)
   * @returns Observable emitting boolean indicating existence
   */
  private costTypeExists(type: string, excludeId?: number): Observable<boolean> {
    return this.costTypeService.getAllCostTypes().pipe(
      map(costTypes => costTypes.some(
        costType => costType.id !== excludeId && 
               costType.type?.toLowerCase() === type?.toLowerCase()
      )),
      catchError(() => {
        return throwError(() => new Error('Failed to check cost type existence'));
      })
    );
  }
}