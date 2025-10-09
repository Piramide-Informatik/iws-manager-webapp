import {Injectable, inject, signal} from '@angular/core';
import { ProjectStatus } from '../Entities/projectStatus';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ProjectStatusService {
    private readonly http = inject(HttpClient);
    private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/projectstatus`;

    private readonly httpOptions = {
        headers: new HttpHeaders({
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        })
    };

    private readonly _projectStatuses = signal<ProjectStatus[]>([]);
    private readonly _loading = signal<boolean>(false);
    private readonly _error = signal<string | null>(null);


    public projectStatuses = this._projectStatuses.asReadonly();
    public loading = this._loading.asReadonly();
    public error = this._error.asReadonly();

    constructor() {
        this.loadInitialData()
    }

    public loadInitialData(): Observable<ProjectStatus[]> {
        this._loading.set(true);
        return this.http.get<ProjectStatus[]>(this.apiUrl, this.httpOptions).pipe(
            tap({
                next: (projectStatuses) => {
                    this._projectStatuses.set(projectStatuses);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to load projectStatuses');
                    console.error('Error loading projectStatuses:', err);
                }
            }),
            catchError(() => of([])),
            tap(() => this._loading.set(false))
        );
    }

    // CREATE 
    addProjectStatus(projectStatus: Omit<ProjectStatus, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ProjectStatus> {
        return this.http.post<ProjectStatus>(this.apiUrl, projectStatus, this.httpOptions).pipe(
            tap({
                next: (newProjectStatus) => {
                    this._projectStatuses.update(projectStatuses => [...projectStatuses, newProjectStatus]);
                    this._error.set(null);
                },
                error: (err) => {
                    this._error.set('Failed to add projectStatus');
                    console.error('Error adding projectStatus:', err);
                },
                finalize: () => this._loading.set(false)
            })
        );
    }

    // UPDATE
    updateProjectStatus(updatedProjectStatus: ProjectStatus): Observable<ProjectStatus> {
        const url = `${this.apiUrl}/${updatedProjectStatus.id}`;
        return this.http.put<ProjectStatus>(url, updatedProjectStatus, this.httpOptions).pipe(
            tap({
                next: (res) => {
                    this._projectStatuses.update(projectStatuses =>
                        projectStatuses.map(t=> t.id === res.id ? res : t)
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
                    this._projectStatuses.update(projectStatuses =>
                        projectStatuses.filter(t => t.id !== id)
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
    getAllProjectStatuses(): Observable<ProjectStatus[]> {
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
      return this.http.get<ProjectStatus>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
        tap(() => this._error.set(null)),
        catchError(err => {
          this._error.set('Failed to fetch project status by id');
          console.error(err);
          return of(undefined as unknown as ProjectStatus);
        })
      );
    }

    public refreshProjectStatuses(): void {
        this.loadInitialData();
    }
}