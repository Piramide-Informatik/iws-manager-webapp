import { Injectable, inject, signal} from '@angular/core';
import { TeamIws } from '../Entities/teamIWS';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})

export class TeamIwsService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/teams-iws`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    private readonly _teamsIws = signal<TeamIws[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);
    
    
    public teamsIws = this._teamsIws.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();
    
    constructor() {
        this.loadInitialData()
    }
    public loadInitialData(): Observable<TeamIws[]> {
        this._loading.set(true);
        return this.http.get<TeamIws[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (teamsIws) => {
                    this._teamsIws.set(teamsIws);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load teamsIws');
                    console.error('Error loading teamsIws:', err);                    }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        );
    }

    // CREATE 
        addTeamIws(teamIws: Omit<TeamIws, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<TeamIws> {
            return this.http.post<TeamIws>(this.apiUrl, teamIws, this.httpOptions).pipe(
                tap({
                    next: (newTeamIws) => {
                        this._teamsIws.update(teamsIws => [...teamsIws, newTeamIws]);
                        this._error.set(null);
                    },
                    error: (err) => {
                        this._error.set('Failed to add teamsIws');
                        console.error('Error adding teamsIws:', err);
                    },
                    finalize: () => this._loading.set(false)
                })
            );
        }

    // UPDATE
        updateTeamIws(updatedTeamIws: TeamIws): Observable<TeamIws> {
            const url = `${this.apiUrl}/${updatedTeamIws.id}`;
            return this.http.put<TeamIws>(url, updatedTeamIws, this.httpOptions).pipe(
                tap({
                    next: (res) => {
                        this._teamsIws.update(teamsIws =>
                            teamsIws.map(t=> t.id === res.id ? res : t)
                        );
                        this._error.set(null);
                    },
                    error: (err) => {
                        this._error.set('Failed to update teamsIws');
                        console.error('Error updating teamsIws:', err);
                    }
                })
            );
        }

    // DELETE
    deleteTeamIws(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
            tap({
                next: () => {
                    this._teamsIws.update(teamsIws =>
                        teamsIws.filter(t => t.id !== id)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to delete teamIws');
                    console.error('Error deleting teamIws:', err);
                }
            })
        );
    }

    //READ
        getAllTeamsIws(): Observable<TeamIws[]> {
            return this.http.get<TeamIws[]>(this.apiUrl, this.httpOptions).pipe(
                tap(() => this._error.set(null)),
                catchError(err => {
                    this._error.set('Failed to fetch TeamIws');
                    console.error('Error fetching TeamIws:', err);
                    return of([]);
                })
            );
        }
    
        getTeamIwsById(id: number): Observable<TeamIws | undefined> {
            const url = `${this.apiUrl}/${id}`;
                return this.http.get<TeamIws>(url, this.httpOptions).pipe(
                    tap(() => this._error.set(null)),
                    catchError(err => {
                    this._error.set('Failed to fetch TeamIws');
                    console.error('Error fetching TeamIws:', err);
                    return of(null as unknown as TeamIws);
                    })
                );
        }

    public refreshTeamsIws(): void {
        this.loadInitialData();
    }
}