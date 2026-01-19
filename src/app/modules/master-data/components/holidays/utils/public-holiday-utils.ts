import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap } from 'rxjs';
import { PublicHoliday } from '../../../../../Entities/publicholiday';
import { PublicHolidayService } from '../../../../../Services/public-holiday.service';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';
import { DayOff } from '../../../../../Entities/dayOff';

@Injectable({ providedIn: 'root' })
export class PublicHolidayUtils {
    private readonly publicHolidayService = inject(PublicHolidayService);

    loadInitialData(): Observable<PublicHoliday[]> {
        return this.publicHolidayService.loadInitialData();
    }

    addPublicHoliday(publicHoliday: Omit<PublicHoliday, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<PublicHoliday> {
        return this.publicHolidayExists(publicHoliday.name).pipe(
            switchMap((exists) => {
                if (exists) {
                    return throwError(() => new Error('holiday already exists'));
                }

                return this.publicHolidayService.addPublicHoliday(publicHoliday);
            }),
            catchError((err) => {
                if (err.message === 'holiday already exists') {
                    return throwError(() => err);
                }

                return throwError(() => new Error('Failed create holiday'));
            })
        );
    }

    //Get a publicHoliday by ID
    getPublicHolidayById(id: number): Observable<PublicHoliday | undefined> {
        if (!id || id <= 0) {
            return throwError(() => new Error('Invalid public holiday ID'));
        }
        return this.publicHolidayService.getPublicHolidayById(id).pipe(
            catchError(err => {
                console.error('Error fetching PublicHoliday:', err);
                return throwError(() => new Error('Failed to load PublicHoliday'));
            })
        );
    }

    getAllPublicHolidays(): Observable<PublicHoliday[]> {
        return this.publicHolidayService.getAllPublicHolidays();
    }

    // Get all holidays and weekend by year and optionally by state
    getAllHolidaysAndWeekendByYear(year: number, stateId?: number): Observable<DayOff[]> {
        return this.publicHolidayService.getAllHolidaysAndWeekendByYear(year, stateId);
    }

    //Creates a new publicHoliday with validation
    createNewPublicHoliday(namePublicHoliday: string): Observable<void> {
        if (!namePublicHoliday?.trim()) {
            return throwError(() => new Error('PublicHoliday name cannot be empty'));
        }
        return new Observable<void>(subscriber => {
            this.publicHolidayService.addPublicHoliday({
                name: namePublicHoliday.trim(),
            });
            subscriber.next();
            subscriber.complete();
        });
    }

    //Check if a publicHoliday exists
    publicHolidayExists(name: string): Observable<boolean> {
        return this.publicHolidayService.getAllPublicHolidays().pipe(
            map(publicHoliday => publicHoliday.some(
                t => t.name.toLowerCase() === name.toLowerCase()
            )),
            catchError(err => {
                console.error('Error checking publicHoliday existence:', err);
                return throwError(() => new Error('Failed to check publicHoliday existence'));
            })
        );
    }

    //Gets all publicHolidays sorted alphabetically by name
    getPublicHolidaysSortedByName(): Observable<PublicHoliday[]> {
        return this.publicHolidayService.getAllPublicHolidays().pipe(
            map(publicHolidays => [...publicHolidays].sort((a, b) => a.name.localeCompare(b.name))),
            catchError(err => {
                console.error('Error sorting publicHolidays:', err);
                return throwError(() => new Error('Failed to sort publicHolidays'));
            })
        );
    }

    //Refreshes publicHolidays data
    refreshpublicHolidays(): Observable<void> {
        return new Observable<void>(subscriber => {
            this.publicHolidayService.refreshProjectStatuses();
            subscriber.next();
            subscriber.complete();
        });
    }

    deletePublicHoliday(id: number): Observable<void> {
        return this.publicHolidayService.deletePublicHoliday(id);
    }

    //Update a projectStatus by ID and updates the internal projectStatus signal
    updatePublicHoliday(publicHoliday: PublicHoliday): Observable<PublicHoliday> {
        if (!publicHoliday?.id) {
            return throwError(() => new Error('Invalid publicHoliday data'));
        }
        return this.publicHolidayService.getPublicHolidayById(publicHoliday.id).pipe(
            take(1),
            switchMap((currentPublicHoliday) => {
                if (!currentPublicHoliday) {
                    return throwError(() => createNotFoundUpdateError('Holiday'));
                }
                if (currentPublicHoliday.version !== publicHoliday.version) {
                    return throwError(() => createUpdateConflictError('Holiday'));
                }
                return this.publicHolidayExists(publicHoliday.name).pipe(
                    switchMap((exists) => {
                        if (exists && currentPublicHoliday.name.toLowerCase() !== publicHoliday.name.toLowerCase()) {
                            return throwError(() => new Error('holiday already exists'));
                        }
                        return this.publicHolidayService.updatePublicHoliday(publicHoliday);
                    })
                );
            }),
            switchMap((validatedPublicHoliday: PublicHoliday) => this.publicHolidayService.updatePublicHoliday(validatedPublicHoliday)),
            catchError((err) => {
                console.error('Error updating PublicHoliday:', err);
                return throwError(() => err);
            })
        );
    }
}