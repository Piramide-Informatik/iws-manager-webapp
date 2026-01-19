import { Injectable, inject, signal } from '@angular/core';
import { PublicHoliday } from '../Entities/publicholiday';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap, throwError } from 'rxjs';
import { environment } from '../../environments/environment';
import { State } from '../Entities/state';
import { DayOff } from '../Entities/dayOff';

@Injectable({
    providedIn: 'root',
})
export class PublicHolidayService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV_V2}/holidays`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
        }),
    };

    private readonly _publicHolidays = signal<PublicHoliday[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    public publicHolidays = this._publicHolidays.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    constructor() {
        this.loadInitialData().subscribe();
    }

    public loadInitialData(): Observable<PublicHoliday[]> {
        this._loading.set(true);
        return this.http.get<PublicHoliday[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (publicHolidays) => {
                    this._publicHolidays.set(publicHolidays);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load publicHolidays');
                    console.error('Error loading publicHolidays:', err);
                },
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        );
    }

    // CREATE 
    addPublicHoliday(projectStatus: Omit<PublicHoliday, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<PublicHoliday> {
        return this.http.post<PublicHoliday>(this.apiUrl, projectStatus, this.httpOptions).pipe(
            tap({
                next: (newPublicHoliday) => {
                    this._publicHolidays.update(publicHolidays => [...publicHolidays, newPublicHoliday]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add publicHolidays');
                    console.error('Error adding publicHolidays:', err);
                },
                finalize: () => this._loading.set(false)
            })
        );
    }

    // UPDATE
    updatePublicHoliday(updatedPublicHoliday: PublicHoliday): Observable<PublicHoliday> {
        const url = `${this.apiUrl}/${updatedPublicHoliday.id}`;
        return this.http.put<PublicHoliday>(url, updatedPublicHoliday, this.httpOptions).pipe(
            tap({
                next: (res) => {
                    this._publicHolidays.update(publicHolidays =>
                        publicHolidays.map(p => p.id === res.id ? res : p)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to update publicHoliday');
                    console.error('Error updating publicHolidays:', err);
                }
            })
        );
    }

    // DELETE
    deletePublicHoliday(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
            tap({
                next: () => {
                    this._publicHolidays.update(publicHolidays =>
                        publicHolidays.filter(p => p.id !== id)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to delete publicHoliday');
                    console.error('Error deleting publicHoliday:', err);
                }
            })
        );
    }
    //READ
    getAllPublicHolidays(): Observable<PublicHoliday[]> {
        return this.http.get<PublicHoliday[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch publicHoliday');
                console.error('Error fetching publicHoliday:', err);
                return of([]);
            })
        );
    }

    getPublicHolidayById(id: number): Observable<PublicHoliday | undefined> {
        return this.http.get<PublicHoliday>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch public holiday by id');
                console.error(err);
                return of(undefined as unknown as PublicHoliday);
            })
        );
    }

    public refreshProjectStatuses(): void {
        this.loadInitialData();
    }

    getStatesByHolidayId(holidayId: number): Observable<State[]> {
        const url = `${this.apiUrl}/${holidayId}/states`;
        return this.http.get<State[]>(url, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch states for publicHoliday');
                console.error('Error fetching states for publicHoliday:', err);
                return of([]);
            })
        );
    }

    saveSelectedStates(holidayId: number, stateIds: number[]): Observable<void> {
        const url = `${this.apiUrl}/${holidayId}/states`;
        return this.http.post<void>(url, stateIds, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to save states for publicHoliday');
                console.error('Error saving states for publicHoliday:', err);
                return throwError(() => err);
            })
        );
    }

    // Get all holidays and weekend by year and optionally by state
    getAllHolidaysAndWeekendByYear(year: number, stateId?: number): Observable<DayOff[]> {
        let url = `${this.apiUrl}/all-with-weekends?year=${year}`;
        if (stateId !== undefined && stateId !== null) {
            url += `&stateId=${stateId}`;
        }
        return this.http.get<DayOff[]>(url, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch holidays and weekend for year');
                console.error('Error fetching holidays and weekend for year:', err);
                return of([]);
            })
        );
    }
}
