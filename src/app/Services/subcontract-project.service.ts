import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { environment } from '../../environments/environment';
import { catchError, Observable, of, tap } from 'rxjs';
import { SubcontractProject } from '../Entities/subcontract-project';

@Injectable({
  providedIn: 'root'
})
export class SubcontractProjectService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/subcontractproject`;
  private readonly _subcontractsProject = signal<SubcontractProject[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public subcontracts = this._subcontractsProject.asReadonly();
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
   * Creates a new subcontract project record
   * @param subcontractProject Subcontract project data (without id, timestamps and version)
   * @returns Observable with the created subcontract project object
   * @throws Error when validation fails or server error occurs
   */
  addSubcontractProject(subcontractProject: Omit<SubcontractProject, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<SubcontractProject> {
    return this.http.post<SubcontractProject>(this.apiUrl, subcontractProject, this.httpOptions).pipe(
      tap({
        next: (newSubcontractProject) => {
          this._subcontractsProject.update(subcontractsProject => [...subcontractsProject, newSubcontractProject]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add subcontract project');
          console.error('Error adding subcontract project:', err);
          return of(subcontractProject);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all subcontracts projects given subcontracts id
   * @param subcontractId Id of the subcontract
   * @returns Observable with subcontract project array
   * @throws Error when server request fails
   */
  getAllSubcontractsProject(subcontractId: number): Observable<SubcontractProject[]> {
    return this.http.get<SubcontractProject[]>(`${this.apiUrl}/subcontract/${subcontractId}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch subcontracts project');
        console.error('Error fetching subcontracts projects:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single subcontract project by ID
   * @param id Subcontract project identifier
   * @returns Observable with Subcontract project object
   * @throws Error when subcontract not found or server error occurs
   */
  getSubcontractProjectById(id: number): Observable<SubcontractProject | undefined> {
    return this.http.get<SubcontractProject>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch subcontract project by id');
        console.error(err);
        return of(undefined as unknown as SubcontractProject);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing subcontract project
   * @param id Subcontract project identifier to update
   * @param subcontract Partial subcontract project data with updates
   * @returns Observable with updated Subcontract object
   * @throws Error when subcontract not found or validation fails
   */
  updateSubcontractProject(updatedSubcontractProject: SubcontractProject): Observable<SubcontractProject> {
    const url = `${this.apiUrl}/${updatedSubcontractProject.id}`;
    return this.http.put<SubcontractProject>(url, updatedSubcontractProject, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._subcontractsProject.update(subcontractsProject =>
            subcontractsProject.map(s => s.id === res.id ? res : s)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update subcontract project');
          console.error('Error updating subcontract project:', err);
        }
      })
    )
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a subcontract project record
   * @param id Subcontract project identifier to delete
   * @returns Empty Observable
   * @throws Error when subcontract not found or server error occurs
   */
  deleteSubcontractProject(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._subcontractsProject.update(subcontractsProject =>
            subcontractsProject.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete subcontract project');
        }
      })
    )
  }

  /**
  * Cleans the state of the subcontracts project
  */
  clearSubcontractsProject(): void {
    this._subcontractsProject.set([]);
    this._error.set(null);
  }

  updateSubcontractProjectData(subcontractsProject: SubcontractProject[]) {
    this._subcontractsProject.set(subcontractsProject)
  }
} 