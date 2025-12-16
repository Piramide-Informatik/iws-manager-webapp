import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { ProjectPackage } from '../Entities/ProjectPackage';

@Injectable({
  providedIn: 'root'
})
export class ProjectPackageService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV_V2}/project-packages`;
  //Signals
  private readonly _projectsPackages = signal<ProjectPackage[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public projectsPackages = this._projectsPackages.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    })
  };

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new project package
   * @param projectPackage project package(without id, timestamps and version)
   * @returns Observable with the created basic project package
   * @throws Error when validation fails or server error occurs
   */
  addProjectPackage(projectPackage: Omit<ProjectPackage, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ProjectPackage> {
    return this.http.post<ProjectPackage>(this.apiUrl, projectPackage, this.httpOptions).pipe(
      tap({
        next: (newFrameworkAgreement) => {
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add project package');
          console.error('Error adding project package:', err);
          return of(projectPackage);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all projects packages by project id
   * @returns Observable with Project packages array
   * @throws Error when server request fails
   */
  getAllProjectsPackagesByProject(projectId: string): Observable<ProjectPackage[]> {
    return this.http.get<ProjectPackage[]>(`${this.apiUrl}/project/${projectId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch projects packages');
        console.error('Error fetching projects packages:', err);
        return of([]);
      })
    );
  }

  /**
  * Cleans the state of the projects packages
  */
  clearProjectsPackages(): void {
    this._projectsPackages.set([]);
    this._error.set(null);
  }
}
