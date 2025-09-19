import { Injectable, inject } from '@angular/core';
import { Observable, catchError, switchMap, take, throwError } from 'rxjs';
import { System } from '../../../../../Entities/system';
import { SystemConstantService } from '../../../../../Services/system-constant.service';

/**
 * Utility class for system-constant related business logic and operations.
 * Works with systemConstantService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class SystemConstantUtils {
  private readonly systemConstantService = inject(SystemConstantService);

  loadInitialData(): Observable<System[]> {
    return this.systemConstantService.loadInitialData();
  }

  /**
     * Gets a System Constant by ID with proper error handling
     * @param id - ID of the System Constant to retrieve
     * @returns Observable emitting the system constant or undefined if not found
     */
  getSystemConstantById(id: number): Observable<System | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid system constant ID'));
    }

    return this.systemConstantService.getSystemConstantById(id).pipe(
      catchError(err => {
        console.error('Error fetching system constant:', err);
        return throwError(() => new Error('Failed to load system constant'));
      })
    );
  }

  /**
   * Creates a new system constant with validation
   * @param systemConstant - New system constant to be created
   * @returns Observable that completes when system constant is created
   */
  createNewSystemConstant(systemConstant: Omit<System, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<System> {
    return this.systemConstantService.addSystemConstant(systemConstant);
  }

  /**
 * Deletes a system constant by ID and updates the internal signal.
 * @param id - ID of the system constant to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteSystemConstant(id: number): Observable<void> {
    return this.systemConstantService.deleteSystemConstant(id);
  }

  /**
 * Updates a system constant by ID and updates the internal titles signal.
 * @param systemConstant - system constant to update
 * @returns Observable that completes when the update is done
 */
  updateSystemConstant(systemConstant: System): Observable<System> {
    if (!systemConstant?.id) {
      return throwError(() => new Error('Invalid system constant data'));
    }

    return this.systemConstantService.getSystemConstantById(systemConstant.id).pipe(
      take(1),
      switchMap((currentSystemConstant) => {
        if (!currentSystemConstant) {
          return throwError(() => new Error('System Constant not found'));
        }

        if (currentSystemConstant.version !== systemConstant.version) {
          return throwError(() => new Error('Conflict detected: system constant version mismatch'));
        }

        return this.systemConstantService.updateSystemConstant(systemConstant);
      })
    );
  }
}