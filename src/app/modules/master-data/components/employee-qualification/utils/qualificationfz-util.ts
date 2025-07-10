import { inject } from '@angular/core';
import { Observable, catchError, map, of, switchMap, take, throwError } from 'rxjs';
import { QualificationFZService } from '../../../../../Services/qualificationfz.service';
import { QualificationFZ } from '../../../../../Entities/qualificationfz';

/**
 * Utility class for qualification-related business logic and operations.
 * Works with QualificationFZService's reactive signals while providing additional functionality.
 */
export class QualificationFZUtils {
  private readonly qualificationFZService = inject(QualificationFZService);

  /**
   * Gets a qualification by ID with proper error handling
   * @param id - ID of the qualification to retrieve
   * @returns Observable emitting the qualification or undefined if not found
   */
  getQualificationFZById(id: number): Observable<QualificationFZ | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid qualification ID'));
    }

    return this.qualificationFZService.getQualificationFZById(id).pipe(
      catchError(err => {
        return throwError(() => new Error('Failed to load qualification'));
      })
    );
  }

  /**
   * Creates a new qualification with validation
   * @param qualification - Name for the new qualification
   * @returns Observable that completes when qualification is created
   */
  createNewQualification(qualification: string): Observable<QualificationFZ> {
    if (!qualification?.trim()) {
      return throwError(() => new Error('Qualification name cannot be empty'));
    }

    return this.qualificationFZService.addQualificationFZ({
      qualification: qualification.trim()
    }).pipe(
      catchError(err => {
        return throwError(() => new Error('Failed to create qualification'));
      })
    );
  }

  /**
   * Checks if a qualification exists (case-insensitive comparison)
   * @param qualification - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  qualificationExists(qualification: string): Observable<boolean> {
    return this.qualificationFZService.getAllQualifications().pipe(
      map(qualifications => qualifications.some(
        q => q.qualification?.toLowerCase() === qualification.toLowerCase()
      )),
      catchError(err => {
        return throwError(() => new Error('Failed to check qualification existence'));
      })
    );
  }

  /**
   * Gets all qualifications sorted alphabetically by name
   * @returns Observable emitting sorted array of qualifications
   */
  getQualificationsSortedByName(): Observable<QualificationFZ[]> {
    return this.qualificationFZService.getAllQualifications().pipe(
      map(qualifications => [...qualifications].sort((a, b) => 
        (a.qualification || '').localeCompare(b.qualification || '')
      )),
      catchError(err => {
        return throwError(() => new Error('Failed to sort qualifications'));
      })
    );
  }

  /**
   * Refreshes qualifications data
   * @returns Observable that completes when refresh is done
   */
  refreshQualifications(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.qualificationFZService.refreshQualifications();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Deletes a qualification by ID and updates the internal qualifications signal.
   * @param id - ID of the qualification to delete
   * @returns Observable that completes when the deletion is done
   */
  deleteQualification(id: number): Observable<void> {
    return this.checkQualificationUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.qualificationFZService.deleteQualificationFZ(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a qualification is used by any employee or other entity.
   * @param id - ID of the qualification to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkQualificationUsage(id: number): Observable<boolean> {
    // TODO: Implement check for qualification usage in employees or other entities
    // For now, return false to allow deletion
    return of(false);
  }

  /**
   * Updates a qualification by ID and updates the internal qualifications signal.
   * @param qualification - QualificationFZ object with updated data
   * @returns Observable that completes when the update is done
   */
  updateQualification(qualification: QualificationFZ): Observable<QualificationFZ> {
    if (!qualification.id) {
      return throwError(() => new Error('Invalid qualification data'));
    }

    return this.qualificationFZService.getQualificationFZById(qualification.id).pipe(
      take(1),
      switchMap((currentQualification) => {
        if (!currentQualification) {
          return throwError(() => new Error('Qualification not found'));
        }

        if (currentQualification.version !== qualification.version) {
          return throwError(() => new Error('Conflict detected: qualification version mismatch'));
        }

        return this.qualificationFZService.updateQualificationFZ(qualification);
      })
    );
  }

  /**
   * Gets all qualifications from the service
   * @returns Observable emitting array of qualifications
   */
  getAllQualifications(): Observable<QualificationFZ[]> {
    return this.qualificationFZService.getAllQualifications().pipe(
      catchError(err => {
        return throwError(() => new Error('Failed to fetch qualifications'));
      })
    );
  }
}