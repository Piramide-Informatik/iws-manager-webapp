import { Injectable, inject, signal } from '@angular/core';
import { HolidayYear } from '../Entities/holidayYear';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class HolidayYearService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/holiday-year`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            Accept: 'application/json',
        }),
    };

    private readonly _holidayYear = signal<HolidayYear[]>([]);
        private readonly _loading = signal<boolean>(false);
        private readonly _error = signal<string | null>(null);
    
        public holidayYear = this._holidayYear.asReadonly();
        public loading = this._loading.asReadonly();
        public error = this._error.asReadonly();
    
    constructor() {
        this.loadInitialData().subscribe();
    }
    public loadInitialData(): Observable<HolidayYear[]> {
        this._loading.set(true);
        return this.http.get<HolidayYear[]>(this.apiUrl, this.httpOptions).pipe(
        tap({
            next: (holidayYears) => {
            this._holidayYear.set(holidayYears);
            this._error.set(null);
            },
            error: (err) => {
            this._error.set('Failed to load holidayYears');
            console.error('Error loading holidayYears:', err);
            },
        }),
        catchError(() => of([])),
        tap(() => this._loading.set(false))
        );
    }

    // GET: /api/v1/holiday-year
    getAll(): Observable<HolidayYear[]> {
        const url = `${this.apiUrl}`;
        return this.http.get<HolidayYear[]>(url, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError((error) => {
                console.error('Error fetching holiday years:', error);
                this._error.set('Failed to fetch holiday years');
                return of([]);
            })
        );
    }

    // GET: /api/v1/holiday-year/public-holiday/{id}
    getByPublicHoliday(id: number): Observable<HolidayYear[]> {
        const url = `${this.apiUrl}/public-holiday/${id}`;
        return this.http.get<HolidayYear[]>(url, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError((error) => {
                console.error(`Error fetching holiday years for public holiday ID ${id}:`, error);
                this._error.set('Failed to fetch holiday years for the specified public holiday');
                return of([]);
            })
        );
    }

    // POST: /api/v1/holiday-year/public-holiday/{id}/next
    createNextYear(id: number): Observable<HolidayYear> {
        const url = `${this.apiUrl}/public-holiday/${id}/next`;
        return this.http.post<HolidayYear>(url, this.httpOptions).pipe(
            tap({
                next: (newHolidayYear) => {
                    this._holidayYear.update(holidayYears => [...holidayYears, newHolidayYear]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to create next holiday year');
                    console.error('Error creating next holiday year:', err);
                },
                finalize: () => this._loading.set(false)
            })
        );
    }
}