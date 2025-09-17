import { Injectable, inject } from '@angular/core';
import { Observable, catchError, switchMap, take, throwError } from 'rxjs';
import { ReminderLevelService } from '../../../../../Services/reminder-level.service';
import { ReminderLevel } from '../../../../../Entities/reminderLevel';

/**
 * Utility class for reminder-level-related business logic and operations.
 * Works with reminderLevelService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class DunningLevelUtils {
  private readonly reminderLevelService = inject(ReminderLevelService);

  loadInitialData(): Observable<ReminderLevel[]> {
    return this.reminderLevelService.loadInitialData();
  }

  /**
     * Gets a Reminder Level by ID with proper error handling
     * @param id - ID of the Reminder Level to retrieve
     * @returns Observable emitting the reminder level or undefined if not found
     */
  getReminderLevelServiceById(id: number): Observable<ReminderLevel | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid reminder level ID'));
    }

    return this.reminderLevelService.getReminderLevelById(id).pipe(
      catchError(err => {
        console.error('Error fetching reminder level:', err);
        return throwError(() => new Error('Failed to load reminder level'));
      })
    );
  }

  /**
   * Creates a new reminder level with validation
   * @param reminderLevel - New reminder level to be created
   * @returns Observable that completes when reminder level is created
   */
  createNewReminderLevel(reminderLevel: Omit<ReminderLevel, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ReminderLevel> {
    return this.reminderLevelService.addReminderLevel(reminderLevel);
  }

  /**
 * Deletes a reminder level by ID and updates the internal signal.
 * @param id - ID of the reminder level to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteReminderLevel(id: number): Observable<void> {
    return this.reminderLevelService.deleteReminderLevel(id);
  }

  /**
 * Updates a reminder level by ID and updates the internal titles signal.
 * @param reminderLevel - reminder level to update
 * @returns Observable that completes when the update is done
 */
  updateReminderLevel(reminderLevel: ReminderLevel): Observable<ReminderLevel> {
    if (!reminderLevel?.id) {
      return throwError(() => new Error('Invalid reminder level data'));
    }

    return this.reminderLevelService.getReminderLevelById(reminderLevel.id).pipe(
      take(1),
      switchMap((currentReminderLevel) => {
        if (!currentReminderLevel) {
          return throwError(() => new Error('Reminder Level not found'));
        }

        if (currentReminderLevel.version !== reminderLevel.version) {
          return throwError(() => new Error('Conflict detected: reminder Level version mismatch'));
        }

        return this.reminderLevelService.updateReminderLevel(reminderLevel);
      })
    );
  }
}