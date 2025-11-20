import { inject, Injectable } from '@angular/core';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';
import { SubcontractYearService } from '../../../../../Services/subcontract-year.service';
import { SubcontractYear } from '../../../../../Entities/subcontract-year';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for subcontracts-year business logic and operations.
 * Works with SubcontractYearService's reactive signals while providing additional functionality.
 */
export class SubcontractYearUtils {
  private readonly subcontractYearService = inject(SubcontractYearService);
  /**
  * Gets all subcontracts years given an id without any transformation
  * @param subcontractId Subcontract it where we retrieve years
  * @returns Observable emitting the raw list of subcontracts years
  */
  getAllSubcontractsYear(subcontractId: number): Observable<SubcontractYear[]> {
    return this.subcontractYearService.getAllSubcontractsYear(subcontractId).pipe(
      catchError(() => throwError(() => new Error('Failed to load subcontracts')))
    );
  }

  /**
  * Gets all subcontracts years given an id without any transformation sorted by year
  * @param subcontractId Subcontract it where we retrieve years
  * @returns Observable emitting the raw list of subcontracts years sorted by year
  */
  getAllSubcontractsYearSortedByYear(subcontractId: number): Observable<SubcontractYear[]> {
    return this.subcontractYearService.getAllSubcontractsYearSortedByYear(subcontractId).pipe(
      catchError(() => throwError(() => new Error('Failed to load subcontracts sorted by year')))
    );
  }

  /**
  * Gets a subcontract year by ID with proper error handling
  * @param id - ID of the subcontract year to retrieve
  * @returns Observable emitting the subcontract year or undefined if not found
  */
  getSubcontractYearById(id: number): Observable<SubcontractYear | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid subcontract year ID'));
    }

    return this.subcontractYearService.getSubcontractYearById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load subcontract year'));
      })
    );
  }

  /**
  * Creates a new subcontract year with validation
  * @param subcontractYear - Subcontract year object to create (without id)
  * @returns Observable that completes when subcontract year is created
  */
  createNewSubcontractYear(subcontractYear: Omit<SubcontractYear, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<SubcontractYear> {
    return this.subcontractYearService.addSubcontractYear(subcontractYear);
  }


  /**
  * Deletes a subcontract year by ID and updates the internal subcontracts year signal.
  * @param id - ID of the subcontract year to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteSubcontractYear(id: number): Observable<void> {
    return this.subcontractYearService.deleteSubcontractYear(id).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
  * Updates a subcontract year by ID and updates the internal subcontracts year signal.
  * @param subcontractYear - Subcontract year object with updated data
  * @returns Observable that completes when the update is done
  */
  updateSubcontractYear(subcontractYear: SubcontractYear): Observable<SubcontractYear> {
    if (!subcontractYear.id) {
      return throwError(() => new Error('Invalid subcontract year data'));
    }

    return this.subcontractYearService.getSubcontractYearById(subcontractYear.id).pipe(
      take(1),
      switchMap((currentSubcontractYear) => {
        if (!currentSubcontractYear) {
          return throwError(() => createNotFoundUpdateError('SubcontractYear'));
        }

        if (currentSubcontractYear.version !== subcontractYear.version) {
          return throwError(() => createUpdateConflictError('SubcontractYear'));
        }

        return this.subcontractYearService.updateSubcontractYear(subcontractYear);
      })
    );
  }
}