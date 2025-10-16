import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, of } from 'rxjs';
import { AbsenceTypeService } from '../../../../../Services/absence-type.service';
import { AbsenceType } from '../../../../../Entities/absenceType';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for absenceType-related business logic and operations.
 * Works with AbsenceTypeService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class AbsenceTypeUtils {
  private readonly absenceTypeService = inject(AbsenceTypeService);
  // Inject other services as needed for cross-entity checks
    // private readonly absenceDayUtils = inject(AbsenceDayUtils);
    // private readonly absenceYearUtils = inject(AbsenceYearUtils);
    // private readonly employeeDayUtils = inject(EmployeeDayUtils);

  loadInitialData(): Observable<AbsenceType[]> {
    return this.absenceTypeService.loadInitialData();
  }

  /**
   * Gets a absence type by ID with proper error handling
   * @param id - ID of the absence type to retrieve
   * @returns Observable emitting the absence type or undefined if not found
   */
  getAbsenceTypeById(id: number): Observable<AbsenceType | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid absence type ID'));
    }

    return this.absenceTypeService.getAbsenceTypeById(id).pipe(
      catchError(err => {
        console.error('Error fetching absence type:', err);
        return throwError(() => new Error('Failed to load absence type'));
      })
    );
  }

  /**
   * Creates a new absence type with validation
   * @param nameAbsenceType - Name for the new absence type
   * @returns Observable that completes when absence type is created
   */
  addAbsenceType(absenceType: Omit<AbsenceType, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<AbsenceType> {
    return this.absenceTypeService.addAbsenceType(absenceType);
  }

  /**
   * Checks if a absenceType exists (case-insensitive comparison)
   * @param name - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  absenceTypeExists(name: string): Observable<boolean> {
    return this.absenceTypeService.getAllAbsenceTypes().pipe(
      map(absenceTypes => absenceTypes.some(
        f => f.name?.toLowerCase() === name.toLowerCase()
      )),
      catchError(err => {
        console.error('Error checking absence type existence:', err);
        return throwError(() => new Error('Failed to check absence type existence'));
      })
    );
  }

  /**
   * Gets all absence types
   * @returns Observable emitting sorted array of absence types
   */
  getAllAbsenceTypes(): Observable<AbsenceType[]> {
    return this.absenceTypeService.getAllAbsenceTypes();
  }

  /**
   * Refreshes customers data
   * @returns Observable that completes when refresh is done
  */
  refreshAbsenceTypes(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.absenceTypeService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a absence type by ID and updates the internal absence types signal.
 * @param id - ID of the absence type to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteAbsenceType(id: number): Observable<void> {
    return this.checkAbsenceTypeUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.absenceTypeService.deleteAbsenceType(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a absence type is used by any customer contacts or employees.
   * @param idFunProgram - ID of the absence type to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkAbsenceTypeUsage(idFunProgram: number): Observable<boolean> {
    // Implement actual checks with injected services
    return of(false);
  }

  /**
 * Updates a absence type by ID and updates the internal absenceTypes signal.
 * @param id - ID of the absence type to update
 * @returns Observable that completes when the update is done
 */
  updateAbsenceType(absenceType: AbsenceType): Observable<AbsenceType> {
    if (!absenceType?.id) {
      return throwError(() => new Error('Invalid absence type data'));
    }

    return this.absenceTypeService.getAbsenceTypeById(absenceType.id).pipe(
      take(1),
      switchMap((currentAbsenceType) => {
        if (!currentAbsenceType) {
          return throwError(() => createNotFoundUpdateError('AbsenceType'));
        }
        if (currentAbsenceType.version !== absenceType.version) {
          return throwError(() => createUpdateConflictError('AbsenceType'));
        }
        return this.absenceTypeService.updateAbsenceType(absenceType);
      }),
      catchError((err) => {
        console.error('Error updating absence type:', err);
        return throwError(() => err);
      })
    );
  }
}