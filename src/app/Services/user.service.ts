import { HttpClient, HttpHeaders } from "@angular/common/http";
import { inject, Injectable, signal } from "@angular/core";
import { environment } from "../../environments/environment";
import { catchError, Observable, of, tap } from "rxjs";
import { User } from "../Entities/user";
import { Role } from "../Entities/role";

@Injectable({
    providedIn: 'root'
})
export class UserService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/users`;

    private readonly _users = signal<User[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    
    public users = this._users.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();
    
    private readonly httpOptions = {
    headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        })
    };
    constructor() {
        this.loadInitialData().subscribe();
    }

    private sortAlphabetically(list: User[]): User[] {
        return [...list].sort((a, b) => a.username.localeCompare(b.username, undefined, { sensitivity: 'base' }));
    }

    public loadInitialData(): Observable<User[]> {
        this._loading.set(true);
        return this.http.get<User[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
            next: (titles) => {
                this._users.set(titles);
                this._error.set(null);
            },
            error: (err) => {
                this._error.set('Failed to load users');
                console.error('Error loading users:', err);
            }
        }),
        catchError(() => of([])),
        tap(() => this._loading.set(false))
        );
    }

    //CREATE
    addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<User> {
        return this.http.post<User>(this.apiUrl, user, this.httpOptions).pipe(
            tap({
            next: (newUser) => {
                this._users.update(users => this.sortAlphabetically([...users, newUser]));
                this._error.set(null);
            },
            error: (err) => {
                this._error.set('Failed to add subcontract user');
                console.error('Error adding subcontract user:', err);
            },
            finalize: () => this._loading.set(false)
            })
        );
    }

    // UPDATE
    updateUser(updatedTitle: User): Observable<User> {
        const url = `${this.apiUrl}/${updatedTitle.id}`;
        return this.http.put<User>(url, updatedTitle, this.httpOptions).pipe(
            tap({
            next: (res) => {
                this._users.update(users =>
                this.sortAlphabetically(users.map(u => u.id === res.id ? res : u))
            );
                this._error.set(null);
            },
            error: (err) => {
                this._error.set('Failed to update user');
                console.error('Error updating user:', err);
            }
        })
        );
    }

    // DELETE
    deleteUser(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
        tap({
        next: () => {
            this._users.update(user =>
            user.filter(u => u.id !== id)
        );
            this._error.set(null);
        },
        error: (err) => {
            this._error.set('Failed to delete user');
            console.error('Error deleting user:', err);
        }
        })
    );
    }

    //READ
    getAllUser(): Observable<User[]> {
        return this.http.get<User[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
            this._error.set('Failed to fetch user');
            console.error('Error fetching user:', err);
            return of([]);
            })
        );
    }

    getUserById(id: number): Observable<User | undefined> {
      return this.http.get<User>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
        tap(() => this._error.set(null)),
        catchError(err => {
          this._error.set('Failed to fetch user by id');
          console.error(err);
          return of(undefined as unknown as User);
        })
      );
    }

    assignRole(userId: number, roleIds: number[]): Observable<User> {
    const url = `${this.apiUrl}/${userId}/roles`;
    return this.http.post<User>(url, roleIds, this.httpOptions).pipe(
        tap({
            next: (updatedUser) => {
                this._users.update(users =>
                    users.map(u => u.id === updatedUser.id ? updatedUser : u)
                );
                this._error.set(null);
            },
            error: (err) => {
                this._error.set('Failed to assign roles');
                console.error('Error assigning roles:', err);
            }
        }),
        catchError(err => {
            console.error('Error in assignRole:', err);
            return of({} as User);
        })
        );
    }

    getRolesByUser(userId: number): Observable<Role[]> {
    const url = `${this.apiUrl}/${userId}/roles`;
    return this.http.get<Role[]>(url, this.httpOptions).pipe(
        tap({
            next: () => this._error.set(null),
            error: (err) => {
                this._error.set('Failed to fetch roles by user');
                console.error('Error fetching roles for user:', err);
            }
        }),
        catchError(() => of([]))
    );
}

    public refreshUser(): void {
    this.loadInitialData();
    }
}