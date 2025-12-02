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
  getAllProjectsPeriodsByProject(projectId: string): Observable<ProjectPeriod[]> {
    return this.http.get<ProjectPeriod[]>(`${this.apiUrl}/by-project/${projectId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch projects period');
        console.error('Error fetching projects period:', err);
        return of([]);
      })
    );
  }

  /**
  * Cleans the state of the projects
  */
  clearProjectsPeriods(): void {
    this._projectsPeriods.set([]);
    this._error.set(null);
  }
}
