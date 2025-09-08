import { Injectable, inject, signal } from '@angular/core';
import { EmployeeCategory } from '../Entities/employee-category ';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root',
    })
    export class EmployeeCategoryService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/employee-category`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
        'Content-Type': 'application/json',
        Accept: 'application/json',
        }),
    };

    private readonly _employeeCategories = signal<EmployeeCategory[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    public employeeCategories = this._employeeCategories.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    constructor() {
        this.loadInitialData();
    }

    public loadInitialData(): Observable<EmployeeCategory[]> {
        this._loading.set(true);
        return this.http
        .get<EmployeeCategory[]>(this.apiUrl, this.httpOptions)
        .pipe(
            tap({
            next: (employeeCategories) => {
                this._employeeCategories.set(employeeCategories);
                this._error.set(null);
            },
            error: (err) => {
                this._error.set('Failed to load employeeCategories');
                console.error('Error loading employeeCategories:', err);
            },
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        );
    }

    // CREATE
    addEmployeeCategory(
        employeeCategory: Omit<
        EmployeeCategory,
        'id' | 'createdAt' | 'updatedAt' | 'version'
        >
    ): Observable<EmployeeCategory> {
        return this.http
        .post<EmployeeCategory>(this.apiUrl, employeeCategory, this.httpOptions)
        .pipe(
            tap({
            next: (newEmployeeCategory) => {
                this._employeeCategories.update((employeeCategories) => [
                ...employeeCategories,
                newEmployeeCategory,
                ]);
                this._error.set(null);
            },
            error: (err) => {
                this._error.set('Failed to add employeeCategory');
                console.error('Error adding employeeCategory:', err);
            },
            finalize: () => {
                this._loading.set(false);
            },
            })
        );
    }

    // UPDATE
    updateEmployeeCategory(
        updatedEmployeeCategory: EmployeeCategory
    ): Observable<EmployeeCategory> {
        const url = `${this.apiUrl}/${updatedEmployeeCategory.id}`;
        return this.http
        .put<EmployeeCategory>(url, updatedEmployeeCategory, this.httpOptions)
        .pipe(
            tap({
            next: (res) => {
                this._employeeCategories.update((employeeCategories) =>
                employeeCategories.map((ec) => (ec.id === res.id ? res : ec))
                );
                this._error.set(null);
            },
            error: (err) => {
                this._error.set('Failed to update employeeCategory');
                console.error('Error updating employeeCategory:', err);
            },
            })
        );
    }

    // DELETE
    deleteEmployeeCategory(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
        tap({
            next: () => {
            this._employeeCategories.update((employeeCategories) =>
                employeeCategories.filter((ec) => ec.id !== id)
            );
            this._error.set(null);
            },
            error: (err) => {
            this._error.set('Failed to delete employeeCategory');
            console.error('Error deleting employeeCategory:', err);
            },
        })
        );
    }

    //READ
    getAllEmployeeCategories(): Observable<EmployeeCategory[]> {
        return this.http
        .get<EmployeeCategory[]>(this.apiUrl, this.httpOptions)
        .pipe(
            tap(() => this._error.set(null)),
            catchError((err) => {
            this._error.set('Failed to fetch EmployeeCategory');
            console.error('Error fetching EmployeeCategory:', err);
            return of([]);
            })
        );
    }

    getEmployeeCategoryById(id: number): Observable<EmployeeCategory | undefined> {
        return this.getAllEmployeeCategories().pipe(
            map(employeeCategories => employeeCategories.find(ec => ec.id === id))
        );
    }

    public refreshEmployeeCategories(): void {
        this.loadInitialData();
    }
}
