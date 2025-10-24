import {Injectable, inject} from '@angular/core';
import {Observable, catchError, map, take, throwError, switchMap, of} from 'rxjs';
import { PublicHoliday } from '../../../../../Entities/publicholiday';
import { PublicHolidayService } from '../../../../../Services/public-holiday.service';
import { createNotFoundUpdateError, createUpdateConflictError} from '../../../../shared/utils/occ-error';

@Injectable({ providedIn: 'root' })
export class PublicHolidayUtils {
    private readonly publicHolidayService = inject(PublicHolidayService);
    
    loadInitialData(): Observable<PublicHoliday[]> {
        return this.publicHolidayService.loadInitialData();
    }

    addPublicHoliday(
        publicHoliday: Omit<PublicHoliday, 'id' | 'createdAt' | 'updatedAt' | 'version'>
    ): Observable<PublicHoliday> {
        return this.publicHolidayService.addPublicHoliday(publicHoliday);
    }

    //Get a publicHoliday by ID
    getPublicHolidayById(id: number): Observable<PublicHoliday | undefined> {
        if (!id || id <= 0) {
            return throwError(() => new Error('Invalid projectStatus ID'));
        }
        return this.publicHolidayService.getPublicHolidayById(id).pipe(
            catchError(err => {
                console.error('Error fetching PublicHoliday:', err);
                return throwError(() => new Error('Failed to load PublicHoliday'));
            })
        );
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

    //Gets next sequence No for public holiday
    getPublicHolidaysSequenceSort(): Observable<number> {
        return this.publicHolidayService.getHolidaySequence().pipe(
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

    //Checks if a publicHolidays is used by any entity
    private checkPublicHolidayUsage(idPublicHoliday: number): Observable<boolean> {
        // For now, no use has been verified in any entity.
        return of(false);
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
                return this.publicHolidayService.updatePublicHoliday(publicHoliday);
            }),
            switchMap((validatedPublicHoliday: PublicHoliday) => this.publicHolidayService.updatePublicHoliday(validatedPublicHoliday)),
            catchError((err) => {
                console.error('Error updating PublicHoliday:', err);
                return throwError(() => err);
            })
        );
    }
}