import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AbsenceDay } from '../Entities/absenceDay';
import { AbsenceDayCountDTO } from '../Entities/AbsenceDayCountDTO';

@Injectable({
    providedIn: 'root'
})
export class AbsenceDayService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV_V2}/absence-days`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    private readonly _absenceDays = signal<AbsenceDay[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    private readonly _absenceDayCounts = signal<AbsenceDayCountDTO[]>([]);

    public absenceDays = this._absenceDays.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();
    public absenceDayCounts = this._absenceDayCounts.asReadonly();

    constructor() {
        this.loadInitialData();
    }

    public loadInitialData(): Observable<AbsenceDay[]> {
        this._loading.set(true);
        return this.http.get<AbsenceDay[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (absenceDays) => {
                    this._absenceDays.set(absenceDays);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load absence days');
                    console.error('Error loading absence days:', err);
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        );
    }

    // CREATE
    addAbsenceDay(absenceDay: Omit<AbsenceDay, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<AbsenceDay> {
        this._loading.set(true);
        return this.http.post<AbsenceDay>(this.apiUrl, absenceDay, this.httpOptions).pipe(
            tap({
                next: (newAbsenceDay) => {
                    this._absenceDays.update(absenceDays => [...absenceDays, newAbsenceDay]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add absence day');
                    console.error('Error adding absence day:', err);
                },
                finalize: () => this._loading.set(false)
            })
        );
    }

    // UPDATE
    updateAbsenceDay(updatedAbsenceDay: AbsenceDay): Observable<AbsenceDay> {
        this._loading.set(true);
        const url = `${this.apiUrl}/${updatedAbsenceDay.id}`;
        return this.http.put<AbsenceDay>(url, updatedAbsenceDay, this.httpOptions).pipe(
            tap({
                next: (res) => {
                    this._absenceDays.update(absenceDays =>
                        absenceDays.map(d => d.id === res.id ? res : d)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to update absence day');
                    console.error('Error updating absence day:', err);
                },
                finalize: () => this._loading.set(false)
            })
        );
    }

    // DELETE
    deleteAbsenceDay(id: number): Observable<void> {
        this._loading.set(true);
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
            tap({
                next: () => {
                    this._absenceDays.update(absenceDays =>
                        absenceDays.filter(d => d.id !== id)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to delete absence day');
                    console.error('Error deleting absence day:', err);
                },
                finalize: () => this._loading.set(false)
            })
        );
    }

    // READ - GetAll
    getAllAbsenceDays(): Observable<AbsenceDay[]> {
        this._loading.set(true);
        return this.http.get<AbsenceDay[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: () => this._error.set(null),
                error: (err) => {
                    this._error.set('Failed to fetch absence days');
                    console.error('Error fetching absence days:', err);
                }
            }),
            catchError(err => {
                this._error.set('Failed to fetch absence days');
                console.error('Error fetching absence days:', err);
                return of([]);
            }),
            tap(() => this._loading.set(false))
        );
    }

    // READ - GetById
    getAbsenceDayById(id: number): Observable<AbsenceDay | undefined> {
        this._loading.set(true);
        return this.http.get<AbsenceDay>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
            tap({
                next: () => this._error.set(null),
                error: (err) => {
                    this._error.set('Failed to fetch absence day by id');
                    console.error(err);
                }
            }),
            catchError(err => {
                this._error.set('Failed to fetch absence day by id');
                console.error(err);
                return of(undefined as unknown as AbsenceDay);
            }),
            tap(() => this._loading.set(false))
        );
    }

    // READ - Get by employee by year
    getAllAbsenceDaysByEmployeeIdByYear(employeeId: number, year: number): Observable<AbsenceDay[]> {
        this._loading.set(true);
        const url = `${this.apiUrl}/by-employee/${employeeId}/year/${year}`;

        return this.http.get<AbsenceDay[]>(url, this.httpOptions).pipe(
            tap({
                next: () =>  this._error.set(null),
                error: (err) => {
                    this._error.set('Failed to get absence days by employee by year');
                    console.error('Error get absence days by employee by year:', err);
                }
            }),
            catchError(err => {
                this._error.set('Failed to get absence days by employee by year');
                console.error('Error get absence days by employee by year:', err);
                return of([]);
            }),
            tap(() => this._loading.set(false))
        );
    }

    // Additional methods
    countAbsenceDaysByTypeForEmployeeAndYear(employeeId: number, year: number): Observable<AbsenceDayCountDTO[]> {
        this._loading.set(true);
        const url = `${this.apiUrl}/count/by-type/employee/${employeeId}/year/${year}`;

        return this.http.get<AbsenceDayCountDTO[]>(url, this.httpOptions).pipe(
            tap({
                next: (counts) => {
                    this._absenceDayCounts.set(counts);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to count absence days by type');
                    console.error('Error counting absence days by type:', err);
                }
            }),
            catchError(err => {
                this._error.set('Failed to count absence days by type');
                console.error('Error counting absence days by type:', err);
                return of([]);
            }),
            tap(() => this._loading.set(false))
        );
    }

    getAbsenceDaysByDateRange(startDate: string, endDate: string): Observable<AbsenceDay[]> {
        this._loading.set(true);
        return this.http.get<AbsenceDay[]>(
            `${this.apiUrl}/range?startDate=${startDate}&endDate=${endDate}`,
            this.httpOptions
        ).pipe(
            tap({
                next: () => this._error.set(null),
                error: (err) => {
                    this._error.set('Failed to fetch absence days by date range');
                    console.error('Error fetching absence days by date range:', err);
                }
            }),
            catchError(err => {
                this._error.set('Failed to fetch absence days by date range');
                console.error('Error fetching absence days by date range:', err);
                return of([]);
            }),
            tap(() => this._loading.set(false))
        );
    }

    public refreshAbsenceDays(): void {
        this.loadInitialData();
    }
}