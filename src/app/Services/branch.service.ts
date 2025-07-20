import { Injectable, inject, signal } from '@angular/core';
import { Branch } from '../Entities/branch';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BranchService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/branches`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  // Signals for reactive state
  private readonly _branches = signal<Branch[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Expose signals as read-only
  public branches = this._branches.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this._loading.set(true);
    this.http.get<Branch[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (branches) => {
          this._branches.set(branches);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load branches');
          console.error('Error loading branches:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    ).subscribe();
  }

  // CREATE
  addBranch(branch: Omit<Branch, 'id' | 'version' | 'createdAt' | 'updatedAt'>): void {
    this.http.post<Branch>(this.apiUrl, branch, this.httpOptions).pipe(
      tap({
        next: (newBranch) => {
          this._branches.update(branches => [...branches, newBranch]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add branch');
          console.error('Error adding branch:', err);
        }
      })
    ).subscribe();
  }

  // UPDATE
  updateBranch(updatedBranch: Branch): void {
    const url = `${this.apiUrl}/${updatedBranch.id}`;
    this.http.put<Branch>(url, updatedBranch, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._branches.update(branches =>
            branches.map(b => b.id === res.id ? res : b)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update branch');
          console.error('Error updating branch:', err);
        }
      })
    ).subscribe();
  }

  // DELETE
  deleteBranch(id: number): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._branches.update(branches =>
            branches.filter(b => b.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete branch');
          console.error('Error deleting branch:', err);
        }
      })
    ).subscribe();
  }

  // READ
  getAllBranches(): Observable<Branch[]> {
    return this.http.get<Branch[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch branches');
        console.error('Error fetching branches:', err);
        return of([]);
      })
    );
  }

  getBranchById(id: number): Observable<Branch | undefined> {
    return this.getAllBranches().pipe(
      map(branches => branches.find(b => b.id === id))
    );
  }

  public refreshBranches(): void {
    this.loadInitialData();
  }
  
}