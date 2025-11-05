import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap, map } from 'rxjs';
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

  loadInitialData(): Observable<AbsenceType[]> {
    return this.absenceTypeService.loadInitialData();
  }

  /**
   * Gets an absence type by ID with proper error handling
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
   */
  addAbsenceType(absenceType: Omit<AbsenceType, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<AbsenceType> {
    const name = absenceType.name?.trim() || '';
    if (!name) {
      return throwError(() => new Error('Absence Type is required'));
    }

    return this.absenceTypeService.addAbsenceType(absenceType);
  }

  /**
   * Checks if an absence type exists (case-insensitive comparison)
   */
  absenceTypeExists(name: string): Observable<boolean> {
    return this.absenceTypeService.getAllAbsenceTypes().pipe(
      switchMap(absenceTypes => {
        const exists = absenceTypes.some(
          f => f.name?.toLowerCase() === name.toLowerCase()
        );
        return new Observable<boolean>(observer => {
          observer.next(exists);
          observer.complete();
        });
      }),
      catchError(err => {
        console.error('Error checking absence type existence:', err);
        return throwError(() => new Error('Failed to check absence type existence'));
      })
    );
  }

  /**
   * Gets all absence types
   */
  getAllAbsenceTypes(): Observable<AbsenceType[]> {
    return this.absenceTypeService.getAllAbsenceTypes();
  }

  /**
   * Refreshes absence types data
   */
  refreshAbsenceTypes(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.absenceTypeService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Deletes an absence type by ID
   * @returns Observable that completes when the deletion is done
   */
  deleteAbsenceType(id: number): Observable<void> {
    return this.absenceTypeService.deleteAbsenceType(id);
  }

  /**
   * Updates an absence type by ID
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