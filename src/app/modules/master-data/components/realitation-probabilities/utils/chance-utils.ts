import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap, of } from 'rxjs';
import { ChanceService } from '../../../../../Services/chance.service';
import { Chance } from '../../../../../Entities/chance';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for chance-related business logic and operations.
 * Works with ChanceService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class ChanceUtils {
  private readonly chanceService = inject(ChanceService);

  loadInitialData(): Observable<Chance[]> {
    return this.chanceService.loadInitialData();
  }

  /**
   * Gets a chance by ID with proper error handling
   * @param id - ID of the chance to retrieve
   * @returns Observable emitting the chance or undefined if not found
   */
  getChanceById(id: number): Observable<Chance | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid chance ID'));
    }

    return this.chanceService.getChanceById(id).pipe(
      catchError(err => {
        console.error('Error fetching chance:', err);
        return throwError(() => new Error('Failed to load chance'));
      })
    );
  }

  /**
   * Creates a new chance with validation
   * @param nameChance - Name for the new chance
   * @returns Observable that completes when chance is created
   */
  addChance(chance: Omit<Chance, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Chance> {
    return this.chanceService.addChance(chance);
  }

  /**
   * Gets all chances
   * @returns Observable emitting sorted array of chances
   */
  getAllChances(): Observable<Chance[]> {
    return this.chanceService.getAllChances();
  }

  /**
   * Refreshes customers data
   * @returns Observable that completes when refresh is done
  */
  refreshChances(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.chanceService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a chance by ID and updates the internal chances signal.
 * @param id - ID of the chance to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteChance(id: number): Observable<void> {
    return this.chanceService.deleteChance(id).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
 * Updates a chance by ID and updates the internal chances signal.
 * @param id - ID of the chance to update
 * @returns Observable that completes when the update is done
 */
  updateChance(chance: Chance): Observable<Chance> {
    if (!chance?.id) {
      return throwError(() => new Error('Invalid chance data'));
    }

    return this.chanceService.getChanceById(chance.id).pipe(
      take(1),
      switchMap((currentChance) => {
        if (!currentChance) {
          return throwError(() => createNotFoundUpdateError('chance'));

        }
        if (currentChance.version !== chance.version) {
          return throwError(() => createUpdateConflictError('chance'));        }
        return this.chanceService.updateChance(chance);
      }),
      catchError((err) => {
        console.error('Error updating chance:', err);
        return throwError(() => err);
      })
    );
  }
}