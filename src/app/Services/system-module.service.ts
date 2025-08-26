import {Injectable, inject, signal} from '@angular/core';
import { SystemModule } from '../Entities/systemModule';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SystemModuleService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/systemmodules`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    private readonly _systemModule = signal<SystemModule[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    
    
    public systemModules = this._systemModule.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    constructor() {
        this.loadInitialData()
    }

    public loadInitialData(): Observable<SystemModule[]> {
        this._loading.set(true);
        return this.http.get<SystemModule[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (projectStatuses) => {
                    this._systemModule.set(projectStatuses);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load systemModules');
                    console.error('Error loading systemModules:', err);
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        );
    }
    //READ
    getAllSystemModules(): Observable<SystemModule[]> {
        return this.http.get<SystemModule[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch systemModule');
                console.error('Error fetching systemModule:', err);
                return of([]);
            })
        );
    }
}