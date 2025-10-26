import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap, map } from 'rxjs';
import { EmployeeIwsService } from '../../../../../Services/employee-iws.service';
import { EmployeeIws } from '../../../../../Entities/employeeIws';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for employeeIws-related business logic and operations.
 * Works with EmployeeIwsService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class EmployeeIwsUtils {
  private readonly employeeIwsService = inject(EmployeeIwsService);

  loadInitialData(): Observable<EmployeeIws[]> {
    return this.employeeIwsService.loadInitialData();
  }

  /**
   * Gets a employeeIws by ID with proper error handling
   * @param id - ID of the employeeIws to retrieve
   * @returns Observable emitting the employeeIws or undefined if not found
   */
  getEmployeeIwsById(id: number): Observable<EmployeeIws | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid employeeIws ID'));
    }

    return this.employeeIwsService.getEmployeeIwsById(id).pipe(
      catchError(err => {
        console.error('Error fetching employeeIws:', err);
        return throwError(() => new Error('Failed to load employeeIws'));
      })
    );
  }

  /**
   * Creates a new employeeIws with validation
   * @param nameEmployeeIws - Name for the new employeeIws
   * @returns Observable that completes when employeeIws is created
   */

  addEmployeeIws(employeeIws: Omit<EmployeeIws, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<EmployeeIws> {
    const employeeLabel = employeeIws.employeeLabel?.trim() || '';
    if (!employeeLabel) {
      return throwError(() => new Error('Employee label is required'));
    }

    return this.employeeIwsShortNameExists(employeeLabel).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(() => new Error('short name already exists'));
        }
        return this.employeeIwsService.addEmployeeIws(employeeIws);
      }),
      catchError((err) => {
        if (err.message === 'short name already exists') {
          return throwError(() => err);
        }
        return throwError(() => new Error('IWS_STAFF.ERROR.CREATION_FAILED'));
      })
    );
  }

  getAllEmployeeIws(): Observable<EmployeeIws[]> {
    return this.employeeIwsService.getAllEmployeeIws();
  }

  getAllEmployeeIwsSortedByFirstName(): Observable<EmployeeIws[]> {
    return this.employeeIwsService.getAllEmployeeIwsSortedByFirstname();
  }

  /**
     * Refreshes customers data
     * @returns Observable that completes when refresh is done
     */
  refreshemployeeIws(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.employeeIwsService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a employeeIws by ID and updates the internal employeeIws signal.
 * @param id - ID of the employeeIws to delete
 * @returns Observable that completes when the deletion is done
 */

  deleteEmployeeIws(id: number): Observable<void> {
    return this.employeeIwsService.deleteEmployeeIws(id)
  }

  /**
 * Updates a employeeIws by ID and updates the internal employeeIws signal.
 * @param id - ID of the employeeIws to update
 * @returns Observable that completes when the update is done
 */
  updateEmployeeIws(employeeIws: EmployeeIws): Observable<EmployeeIws> {
    if (!employeeIws?.id) {
      return throwError(() => new Error('Invalid employeeIws data'));
    }

    const employeeLabel = employeeIws.employeeLabel?.trim() || '';
    if (!employeeLabel) {
      return throwError(() => new Error('Employee label is required'));
    }

    return this.employeeIwsService.getEmployeeIwsById(employeeIws.id).pipe(
      take(1),
      switchMap((currentEmployeeIws) => {
        if (!currentEmployeeIws) {
          return throwError(() => createNotFoundUpdateError('IWS Employee'));
        }
        if (currentEmployeeIws.version !== employeeIws.version) {
          return throwError(() => createUpdateConflictError('IWS Employee'));
        }
        
        return this.employeeIwsShortNameExists(employeeLabel, employeeIws.id).pipe(
          switchMap((exists) => {
            if (exists) {
              return throwError(() => new Error('short name already exists'));
            }
            return this.employeeIwsService.updateEmployeeIws(employeeIws);
          })
        );
      }),
      catchError((err) => {
        console.error('Error updating employeeIws:', err);
        return throwError(() => err);
      })
    );
  }
  getNextEmployeeNo(): Observable<number> {
    return this.employeeIwsService.getNextEmployeeNo().pipe(
      catchError(err => {
        console.error('Error fetching next employee number:', err);
        return throwError(() => new Error('Failed to load next employee number'));
      })
    );
  }
  /**
   * Checks if a employee short name already exists (case-insensitive comparison)
   * @param shortName - Short name to check
   * @param excludeId - ID to exclude from check (for updates)
   * @returns Observable emitting boolean indicating existence
   */
  private employeeIwsShortNameExists(shortName: string, excludeId?: number): Observable<boolean> {
    return this.employeeIwsService.getAllEmployeeIws().pipe(
      map(employees => employees.some(
        emp => emp.id !== excludeId && 
               emp.employeeLabel?.toLowerCase() === shortName?.toLowerCase()
      )),
      catchError(() => {
        return throwError(() => new Error('Failed to check short name existence'));
      })
    );
  }
}