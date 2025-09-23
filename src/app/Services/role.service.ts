import { Injectable, inject, signal } from "@angular/core";
import { Role } from "../Entities/role";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, catchError, map, of, tap } from "rxjs";
import { environment } from "../../environments/environment";

@Injectable({
    providedIn: 'root'
})
export class RoleService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/roles`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };
    // Signals for reactive state
    private readonly _roles = signal<Role[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Expose signals as read-only
    public roles = this._roles.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    constructor() {
        this.loadInitialData()
    }

    public loadInitialData(): Observable <Role[]> {
        this._loading.set(true);
        return this.http.get<Role[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (statuses) => {
                    this._roles.set(statuses);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load roles');
                    console.error('Error loading roles:', err);
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        )
    }

    // CREATE
    addRole(status: Omit<Role, 'id' | 'version' | 'createdAt' | 'updatedAt'>): Observable<Role> {
        return this.http.post<Role>(this.apiUrl, status, this.httpOptions).pipe(
            tap({
                next: (newStatus) => {
                    this._roles.update(roles => [...roles, newStatus]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add roles');
                    console.error('Error adding roles:', err);
                }
            })
        )
    }

    //UPDATE
    updateRole(role: Role): Observable<Role> {
        const url = `${this.apiUrl}/${role.id}`;
        return this.http.put<Role>(url, role, this.httpOptions).pipe(
            tap({
                next: (updatedStatus) => {
                    this._roles.update(roles => 
                        roles.map(r => r.id === updatedStatus.id ? updatedStatus : r)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to update roles');
                    console.error('Error updating roles:', err);
                }
            })
        )
    }

    // DELETE
    deleteRole(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
            tap({
                next: () => {
                    this._roles.update(roles =>
                        roles.filter(r => r.id !== id)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set(err);
                    console.error('Error deleting role:', err);
                }
            })
        );
    }

    // READ
    getAllRoles(): Observable<Role[]> {
        return this.http.get<Role[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch roles');
                console.error('Error fetching roles:', err);
                return of([]);
            })
        );
    }

    getRoleById (id: number): Observable<Role | undefined> {
            return this.getAllRoles().pipe(
                map(roles => roles.find(role => role.id === id))
            );
        }

    public refreshRoles(): void {
        this.loadInitialData();
    }
}