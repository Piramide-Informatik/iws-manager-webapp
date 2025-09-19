import { Injectable, inject, signal } from "@angular/core";
import { RightRole } from "../Entities/rightRole";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, of, tap } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class RightRoleService {

    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/rolerights`;
    
    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };
    // Signals for reactive state
    private readonly _rightRole = signal<RightRole[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    
    // Expose signals as read-only
    public roles = this._rightRole.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();
    
    constructor() {
        this.loadInitialData()
    }
    
    public loadInitialData(): Observable <RightRole[]> {
        this._loading.set(true);
        return this.http.get<RightRole[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (statuses) => {
                    this._rightRole.set(statuses);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load RightRole');
                    console.error('Error loading RightRole:', err);
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        )
    }

    // CREATE
    addRightRole(status: Omit<RightRole, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Observable<RightRole> {
        return this.http.post<RightRole>(this.apiUrl, status, this.httpOptions).pipe(
            tap({
                next: (newRightRole) => {
                    this._rightRole.update(rightRole => [...rightRole, newRightRole]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add RightRole');
                    console.error('Error adding RightRole:', err);
                }
            })
        )
    }

    //UPDATE
    updateRightRole(rightRole: RightRole): Observable<RightRole> {
        const url = `${this.apiUrl}/${rightRole.id}`;
        return this.http.put<RightRole>(url, rightRole, this.httpOptions).pipe(
            tap({
                next: (updatedRightRole) => {
                    this._rightRole.update(rightRole => 
                        rightRole.map(r => r.id === updatedRightRole.id ? updatedRightRole : r)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to update RightRole');
                    console.error('Error updating RightRole:', err);
                }
            })
        )
    }

    // DELETE
    deleteRightRole(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
            tap({
                next: () => {
                    this._rightRole.update(rightRole =>
                        rightRole.filter(r => r.id !== id)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to delete rightRole');
                    console.error('Error deleting rightRole:', err);
                }
            })
        );
    }

    // READ
    getAllRightRole(): Observable<RightRole[]> {
        return this.http.get<RightRole[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch RightRole');
                console.error('Error fetching RightRole:', err);
                return of([]);
            })
        );
    }

    getRightRoleById (id: number): Observable<RightRole> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.get<RightRole>(url, this.httpOptions).pipe(
                tap(() => this._error.set(null)),
                catchError(err => {
                    this._error.set('Failed to fetch RightRole');
                    console.error('Error fetching RightRole:', err);
                    return of(null as unknown as RightRole);
                })
        );
    }

    getRightRolesByModuleId(moduleId: number, roleId: number) {
        const url = `${this.apiUrl}/module/${moduleId}/role/${roleId}`;
        return this.http.get<RightRole[]>(url, this.httpOptions).pipe(
                tap(() => this._error.set(null)),
                catchError(err => {
                    this._error.set('Failed to fetch RightRole');
                    console.error('Error fetching RightRole:', err);
                    return of([] as unknown as RightRole []);
                })
        );
    }

    saveAll(rightRoles: RightRole []) : Observable<RightRole[]> {
    const url = `${this.apiUrl}/bulk`;
    return this.http.post<RightRole[]>(url, rightRoles, this.httpOptions).pipe(
                tap({
                    next: (newRightRoles) => {
                        this._rightRole.update(rightRole => [...rightRole, ...newRightRoles]);
                        this._error.set(null);
                    },
                    error: (err) => {
                        this._error.set('Failed to add all RightRole');
                        console.error('Error adding RightRoles:', err);
                    }
                })
            )
    }
    
    public refreshRoles(): void {
        this.loadInitialData();
    }
}