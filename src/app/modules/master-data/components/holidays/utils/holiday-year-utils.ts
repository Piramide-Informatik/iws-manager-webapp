import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap } from 'rxjs';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';
import { HolidayYearService } from '../../../../../Services/holiday-year.service';
import { HolidayYear } from '../../../../../Entities/holidayYear';
import { PublicHoliday } from '../../../../../Entities/publicholiday';

/**
 * Utility class for holiday-year-related business logic and operations.
 * Works with HolidayYearService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class HolidayYearUtils {
  private readonly holidayYearService = inject(HolidayYearService);

  loadInitialData(): Observable<HolidayYear[]> {
    return this.holidayYearService.loadInitialData();
  }

  /**
   * Gets a holidayYear by ID with proper error handling
   * @param id - ID of the holidayYear to retrieve
   * @returns Observable emitting the text or undefined if not found
   */
  getHolidayYearById(id: number): Observable<HolidayYear | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid holiday year ID'));
    }

    return this.holidayYearService.getHolidayYearById(id).pipe(
      catchError((err) => {
        console.error('Error fetching holiday year:', err);
        return throwError(() => new Error('Failed to load holiday year'));
      })
    );
  }

  /**
   * Creates a new holiday year with validation
   * @param holidayYear - New holiday year
   * @returns Observable that completes when holiday year is created
   */
  createHolidayYear(holidayYear: Omit<HolidayYear, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<HolidayYear> {
    return this.holidayYearService.createHolidayYear(holidayYear);
  }

  /**
   * Creates next a new holiday year with validation
   * @param publicHoliday - Public holiday asociated
   * @returns Observable that completes when holiday year is created
   */
  createNextHolidayYear(publicHoliday: PublicHoliday): Observable<HolidayYear> {
    return this.holidayYearService.createNextYear(publicHoliday.id);
  }

  /**
   * Gets all holiday years
   * @returns Observable emitting sorted array of holiday years
   */
  getAllHolidayYears(): Observable<HolidayYear[]> {
    return this.holidayYearService.getAllHolidayYears();
  }

  /**
   * Refreshes holiday years data
   * @returns Observable that completes when refresh is done
   */
  refreshHolidayYears(): Observable<void> {
    return new Observable<void>((subscriber) => {
      this.holidayYearService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Deletes a holiday year by ID and updates the internal texts signal.
   * @param id - ID of the holiday year to delete
   * @returns Observable that completes when the deletion is done
   */
  deleteHolidayYear(id: number): Observable<void> {
    return this.holidayYearService.deleteHolidayYear(id);
  }

  /**
   * Updates a holiday year by ID and updates the internal holiday years signal.
   * @param holidayYear - Holiday year to update
   * @returns Observable that completes when the update is done
   */
  updateHolidayYear(holidayYear: HolidayYear): Observable<HolidayYear> {
    if (!holidayYear?.id) {
      return throwError(() => new Error('Invalid holiday year data'));
    }

    return this.holidayYearService.getHolidayYearById(holidayYear.id).pipe(
      take(1),
      switchMap((currentHolidayYear) => {
        if (!currentHolidayYear) {
          return throwError(() => createNotFoundUpdateError('Holiday Year'));
        }
        if (currentHolidayYear.version !== holidayYear.version) {
          return throwError(() => createUpdateConflictError('Holiday Year'));
        }
        return this.holidayYearService.updateHolidayYear(holidayYear);
      }),
      catchError((err) => {
        console.error('Error updating holiday year:', err);
        return throwError(() => err);
      })
    );
  }
}
