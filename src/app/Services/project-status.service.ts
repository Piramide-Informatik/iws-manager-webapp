import {Injectable, inject, signal} from '@angular/core';
import { ProjectStatus } from '../Entities/projectStatus';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class projectStatusService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/projectStatus`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    // Signals para estado reactivo
    private readonly _projectStatus = signal<ProjectStatus[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);

    // Exponer señales como read-only
    public projectStatus = this._projectStatus.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    constructor() {
        this.loadInitialData();
    }

    private loadInitialData(): void {
        this._loading.set(true);
        this.http.get<ProjectStatus[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (projectStatus) => {
                    this._projectStatus.set(projectStatus);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load projectStatus');
                    console.error('Error loading projectStatus:', err);
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        ).subscribe();
    }

    // CREATE 
    addProjectStatus(projectStatus: Omit<ProjectStatus, 'id' | 'createdAt' | 'updatedAt' | 'version'>): void {
        this.http.post<ProjectStatus>(this.apiUrl, projectStatus, this.httpOptions).pipe(
            tap({
                next: (newProjectStatus) => {
                    this._projectStatus.update(projectStatus => [...projectStatus, newProjectStatus]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add projectStatus');
                    console.error('Error adding projectStatus:', err);
                }
            })
        ).subscribe();
    }

    // UPDATE
    updateProjectStatus(updatedProjectStatus: ProjectStatus): Observable<ProjectStatus> {
        const url = `${this.apiUrl}/${updatedProjectStatus.id}`;
        return this.http.put<ProjectStatus>(url, updatedProjectStatus, this.httpOptions).pipe(
            tap({
                next: (res) => {
                    this._projectStatus.update(projectStatus =>
                        projectStatus.map(t=> t.id === res.id ? res : t)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to update projectStatus');
                    console.error('Error updating projectStatus:', err);
                }
            })
        );
    }

    // DELETE
    deleteProjectStatus(id: number): Observable<void> {
        const url = `${this.apiUrl}/${id}`;
        return this.http.delete<void>(url, this.httpOptions).pipe(
            tap({
                next: () => {
                    this._projectStatus.update(projectStatus =>
                        projectStatus.filter(t => t.id !== id)
                    );
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to delete projectStatus');
                    console.error('Error deleting projectStatus:', err);
                }
            })
        );
    }
    //READ
    getAllProjectStatus(): Observable<ProjectStatus[]> {
        return this.http.get<ProjectStatus[]>(this.apiUrl, this.httpOptions).pipe(
            tap(() => this._error.set(null)),
            catchError(err => {
                this._error.set('Failed to fetch projectStatus');
                console.error('Error fetching projectStatus:', err);
                return of([]);
            })
        );
    }

    getProjectStatusById(id: number): Observable<ProjectStatus | undefined> {
        return this.getAllProjectStatus().pipe(
            map(projectStatus => projectStatus.find(t => t.id === id))
        );
    }

    public refreshProjectStatus(): void {
        this.loadInitialData();
    }
}