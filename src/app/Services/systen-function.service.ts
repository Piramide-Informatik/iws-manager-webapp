import {Injectable, inject, signal} from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { SystemFunction } from '../Entities/systemFunction';

@Injectable({
    providedIn: 'root'
})

export class SystemFunctionService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_LOCALHOST_DEV}/systemfunctions`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    private readonly _systemFunction = signal<SystemFunction[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    
    
    public systemFunction = this._systemFunction.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    constructor() {
        this.loadInitialData()
    }
    public loadInitialData(): Observable<SystemFunction[]> {
        this._loading.set(true);
        return this.http.get<SystemFunction[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (projectStatuses) => {
                    this._systemFunction.set(projectStatuses);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load systemFunction');
                    console.error('Error loading systemFunction:', err);
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        );
    }

//READ
    getAllSystemModules(): Observable<SystemFunction[]> {
        return this.http.get<SystemFunction[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch systemModule');
                console.error('Error fetching systemModule:', err);
                return of([]);
            })
        );
    }
// GET FUNCTIONS BY MODULE ID
    getFunctionsByModuleId(moduleId: number): Observable<SystemFunction[]> {
        const url = `${this.apiUrl}/module/${moduleId}`;
        return this.http.get<SystemFunction[]>(url, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch functions by module ID');
                console.error('Error fetching functions by module ID:', err);
                return of([]);
            })
        );
    }
}