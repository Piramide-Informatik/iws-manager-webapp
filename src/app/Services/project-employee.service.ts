import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { ProjectEmployee } from '../Entities/projectEmployee';

@Injectable({
  providedIn: 'root'
})
export class ProjectEmployeeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/project-employees`;
  //Signals
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

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
   * Retrieves all projects employee by project id
   * @returns Observable with Project employee array
   * @throws Error when server request fails
   */
  getAllProjectsEmployeeByProject(projectId: number): Observable<ProjectEmployee[]> {
    return this.http.get<ProjectEmployee[]>(`${this.apiUrl}/project/${projectId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch projects employee');
        console.error('Error fetching projects employee:', err);
        return of([]);
      })
    );
  }

}
