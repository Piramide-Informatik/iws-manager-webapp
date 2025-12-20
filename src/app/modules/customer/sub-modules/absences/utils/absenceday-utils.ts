import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap } from 'rxjs';
import { AbsenceDay } from '../../../../../Entities/absenceDay';
import { AbsenceDayService } from '../../../../../Services/absence-day.service';
import { AbsenceDayCountDTO } from '../../../../../Entities/AbsenceDayCountDTO';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';


/**
 * Utility class for absenceDay-related business logic and operations.
 * Works with AbsenceDayService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class AbsenceDayUtils {
    private readonly absenceDayService = inject(AbsenceDayService);

    loadInitialData(): Observable<AbsenceDay[]> {
        return this.absenceDayService.loadInitialData();
    }

    /**
     * Gets an absence day by ID with proper error handling
     */
    getAbsenceDayById(id: number): Observable<AbsenceDay | undefined> {
        if (!id || id <= 0) {
            return throwError(() => new Error('Invalid absence day ID'));
        }

        return this.absenceDayService.getAbsenceDayById(id).pipe(
            catchError(err => {
                console.error('Error fetching absence day:', err);
                return throwError(() => new Error('Failed to load absence day'));
            })
        );
    }

    /**
     * Creates a new absence day with validation
     */
    addAbsenceDay(absenceDay: Omit<AbsenceDay, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<AbsenceDay> {
        return this.absenceDayService.addAbsenceDay(absenceDay);
    }

    /**
     * Gets all absence days
     */
    getAllAbsenceDays(): Observable<AbsenceDay[]> {
        return this.absenceDayService.getAllAbsenceDays();
    }

    /**
     * Get all absence days by employee by year
     */
    getAllAbsenceDaysByEmployeeIdByYear(employeeId: number, year: number): Observable<AbsenceDay[]> {
        if (!employeeId || employeeId <= 0) {
            return throwError(() => new Error('Invalid employee ID'));
        }

        return this.absenceDayService.getAllAbsenceDaysByEmployeeIdByYear(employeeId, year);
    }

    /**
     * Counts absence days by type for a specific employee and year
     */
    countAbsenceDaysByTypeForEmployeeAndYear(employeeId: number, year: number): Observable<AbsenceDayCountDTO[]> {
        if (!employeeId || employeeId <= 0) {
            return throwError(() => new Error('Invalid employee ID'));
        }

        return this.absenceDayService.countAbsenceDaysByTypeForEmployeeAndYear(employeeId, year).pipe(
            catchError(err => {
                console.error('Error counting absence days by type:', err);
                return throwError(() => new Error('Failed to count absence days'));
            })
        );
    }

    /**
     * Refreshes absence days data
     */
    refreshAbsenceDays(): Observable<void> {
        return new Observable<void>(subscriber => {
            this.absenceDayService.loadInitialData();
            subscriber.next();
            subscriber.complete();
        });
    }

    /**
     * Deletes an absence day by ID
     */
    deleteAbsenceDay(id: number): Observable<void> {
        if (!id || id <= 0) {
            return throwError(() => new Error('Invalid absence day ID'));
        }

        return this.absenceDayService.deleteAbsenceDay(id);
    }

    /**
     * Updates an absence day by ID with optimistic concurrency control
     */
    updateAbsenceDay(absenceDay: AbsenceDay): Observable<AbsenceDay> {
        if (!absenceDay?.id) {
            return throwError(() => new Error('Invalid absence day data'));
        }

        return this.absenceDayService.getAbsenceDayById(absenceDay.id).pipe(
            take(1),
            switchMap((currentAbsenceDay) => {
                if (!currentAbsenceDay) {
                    return throwError(() => createNotFoundUpdateError('AbsenceDay'));
                }
                if (currentAbsenceDay.version !== absenceDay.version) {
                    return throwError(() => createUpdateConflictError('AbsenceDay'));
                }
                return this.absenceDayService.updateAbsenceDay(absenceDay);
            }),
            catchError((err) => {
                console.error('Error updating absence day:', err);
                return throwError(() => err);
            })
        );
    }

    /**
     * Gets total absence days count for an employee in a specific year
     */
    getTotalAbsenceDaysForEmployeeYear(employeeId: number, year: number): Observable<number> {
        return this.countAbsenceDaysByTypeForEmployeeAndYear(employeeId, year).pipe(
            switchMap(counts => {
                const total = counts.reduce((sum, item) => sum + item.count, 0);
                return new Observable<number>(observer => {
                    observer.next(total);
                    observer.complete();
                });
            }),
            catchError(err => {
                console.error('Error calculating total absence days:', err);
                return throwError(() => new Error('Failed to calculate total absence days'));
            })
        );
    }
}