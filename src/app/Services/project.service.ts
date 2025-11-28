import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { Project } from '../Entities/project';

@Injectable({
  providedIn: 'root'
})
export class ProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV_V2}/projects`;
  //Signals
  private readonly _projects = signal<Project[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public projects = this._projects.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    })
  };

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<Project[]> {
    this._loading.set(true);
    return this.http.get<Project[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (projects) => {
          this._projects.set(projects);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load project types');
          console.error('Error loading project types:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new project record
   * @param project project data (without id, timestamps and version)
   * @returns Observable with the created project object
   * @throws Error when validation fails or server error occurs
   */
  addProject(project: Omit<Project, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project, this.httpOptions).pipe(
      tap({
        next: (newProject) => {
          this._projects.update(projects => [...projects, newProject]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add project');
          console.error('Error adding project:', err);
          return of(project);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all projects
   * @returns Observable with Project array
   * @throws Error when server request fails
   */
  getAllProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch projects');
        console.error('Error fetching projects:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single project by ID
   * @param id Project identifier
   * @returns Observable with Project object
   * @throws Error when project not found or server error occurs
   */
  getProjectById(id: number): Observable<Project | undefined> {
    return this.http.get<Project>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch project by id');
        console.error(err);
        return of(undefined as unknown as Project);
      })
    );
  }

  /**
   * Retrieves all projects given a customer
   * @param customerId Customer to get his projects
   * @returns Observable with Project array
   * @throws Error when server request fails
   */
  getAllProjectsByCustomerId(customerId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}/by-customer/${customerId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch projects');
        console.error('Error fetching projects:', err);
        return of([]);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing project
   * @param id Project identifier to update
   * @param project Partial project data with updates
   * @returns Observable with updated Project object
   * @throws Error when project not found or validation fails
   */
  updateProject(updatedProject: Project): Observable<Project> {
    const url = `${this.apiUrl}/${updatedProject.id}`;
    return this.http.put<Project>(url, updatedProject, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._projects.update(projects =>
            projects.map(s => s.id === res.id ? res : s)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update project');
          console.error('Error updating project:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a project record
   * @param id project identifier to delete
   * @returns Empty Observable
   * @throws Error when project not found or server error occurs
   */
  deleteProject(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._projects.update(projects =>
            projects.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete project');
        }
      })
    )
  }

  /**
  * Cleans the state of the projects
  */
  clearProjects(): void {
    this._projects.set([]);
    this._error.set(null);
  }

  updateProjectData(projects: Project[]) {
    this._projects.set(projects)
  }
}
