import { Injectable, inject, signal } from '@angular/core';
import { Branch } from '../Entities/branch';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BranchService {

  private http = inject(HttpClient);
  private apiUrl = 'assets/data/branch.json';

  private _branches = signal<Branch[]>([]);
  private _loading = signal<boolean>(false);
  private _error = signal<string | null>(null);

  public branches = this._branches.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this._loading.set(true);
    this.http.get<{ branches: Branch[] }>(this.apiUrl).pipe(
      map(response => response.branches),
      tap({
        next: (branches) => {
          this._branches.set(branches);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load branches');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    ).subscribe();
  }

  // CREATE
  addBranch(branch: Omit<Branch, 'uuid'>): void {
    const newBranch: Branch = {
      ...branch,
      uuid: this.generateUUID()
    };
    this._branches.update(branches => [...branches, newBranch]);
  }

  // UPDATE
  updateBranch(updatedBranch: Branch): void {
    this._branches.update(branches =>
      branches.map(b => b.uuid === updatedBranch.uuid ? updatedBranch : b)
    );
  }

  // DELETE
  deleteBranch(uuid: string): void {
    this._branches.update(branches =>
      branches.filter(b => b.uuid !== uuid)
    );
  }

  // READ
  getAllBranches(): Observable<Branch[]> {
    return this.http.get<{ branches: Branch[] }>(this.apiUrl).pipe(
      map(response => response.branches),
      catchError(() => of([]))
    );
  }

  getBranchById(id: number): Observable<Branch | undefined> {
    return this.getAllBranches().pipe(
      map(branches => branches.find(b => b.id === id))
    );
  }

  // Helper
  private generateUUID(): string {
    return crypto.randomUUID();
  }
}
