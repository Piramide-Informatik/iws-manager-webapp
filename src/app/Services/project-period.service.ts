import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { ProjectPeriod } from '../Entities/project-period';

@Injectable({
  providedIn: 'root'
})
export class ProjectPeriodService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/project-periods`;
  //Signals
  private readonly _projectsPeriods = signal<ProjectPeriod[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public projectsPeriods = this._projectsPeriods.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    })
  };

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all projects periods by project id
   * @returns Observable with Project periods array
   * @throws Error when server request fails
   */
  getAllProjectsPeriodsByProject(projectId: number): Observable<ProjectPeriod[]> {
    return this.http.get<ProjectPeriod[]>(`${this.apiUrl}/project/${projectId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch projects period');
        console.error('Error fetching projects period:', err);
        return of([]);
      })
    );
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a project period
   * @param id Project period identifier to delete
   * @returns Empty Observable
   * @throws Error when project period not found or server error occurs
   */
  deleteProjectPeriod(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete project period');
        }
      })
    )
  }

  /**
   * Retrieves a single project period by ID
   * @param id Project period identifier
   * @returns Observable with Project period object
   * @throws Error when project not found or server error occurs
   */
  getProjectPeriodById(id: number): Observable<ProjectPeriod | undefined> {
    return this.http.get<ProjectPeriod>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch project period by id');
        console.error(err);
        return of(undefined as unknown as ProjectPeriod);
      })
    );
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new project period record
   * @param projectPeriod project period data (without id, timestamps and version)
   * @returns Observable with the created project period object
   * @throws Error when validation fails or server error occurs
   */
  addProjectPeriod(projectPeriod: Omit<ProjectPeriod, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ProjectPeriod> {
    return this.http.post<ProjectPeriod>(this.apiUrl, projectPeriod, this.httpOptions).pipe(
      tap({
        next: (newProjectPeriod) => {
          this._projectsPeriods.update(projectsPeriods => [...projectsPeriods, newProjectPeriod]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add project period');
          console.error('Error adding project period:', err);
          return of(projectPeriod);
        }
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing project period
   * @param updatedProjectPeriod Partial project period data with updates
   * @returns Observable with updated Project period object
   * @throws Error when project not found or validation fails
   */
  updateProjectPeriod(updatedProjectPeriod: ProjectPeriod): Observable<ProjectPeriod> {
    const url = `${this.apiUrl}/${updatedProjectPeriod.id}`;
    return this.http.put<ProjectPeriod>(url, updatedProjectPeriod, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._projectsPeriods.update(projects =>
            projects.map(s => s.id === res.id ? res : s)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update project period');
          console.error('Error updating project period:', err);
        }
      })
    )
  }

  /**
  * Cleans the state of the projects
  */
  clearProjectsPeriods(): void {
    this._projectsPeriods.set([]);
    this._error.set(null);
  }
}
