import { Injectable, inject, signal } from '@angular/core';
import { QualificationFZ } from '../Entities/qualificationfz';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class QualificationFZService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/qualificationfz`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  // Signals for reactive state
  private readonly _qualificationFZs = signal<QualificationFZ[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Expose signals as read-only
  public qualificationFZs = this._qualificationFZs.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): Observable<QualificationFZ[]> {
    this._loading.set(true);
    return this.http.get<QualificationFZ[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (qualificationFZs) => {
          this._qualificationFZs.set(qualificationFZs);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load qualifications');
          console.error('Error loading qualifications:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addQualificationFZ(qualificationFZ: Omit<QualificationFZ, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<QualificationFZ> {
    return this.http.post<QualificationFZ>(this.apiUrl, qualificationFZ, this.httpOptions).pipe(
      tap({
        next: (newQualificationFZ) => {
          this._qualificationFZs.update(qualificationFZs => [...qualificationFZs, newQualificationFZ]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add qualification');
          console.error('Error adding qualification:', err);
        }
      })
    );
  }

  // UPDATE
  updateQualificationFZ(updatedQualificationFZ: QualificationFZ): Observable<QualificationFZ> {
    const url = `${this.apiUrl}/${updatedQualificationFZ.id}`;
    return this.http.put<QualificationFZ>(url, updatedQualificationFZ, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._qualificationFZs.update(qualificationFZs =>
            qualificationFZs.map(b => b.id === res.id ? res : b)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update qualification');
          console.error('Error updating qualification:', err);
        }
      })
    );
  }

  // DELETE
  deleteQualificationFZ(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._qualificationFZs.update(qualificationFZs =>
            qualificationFZs.filter(b => b.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete qualification');
          console.error('Error deleting qualification:', err);
        }
      })
    );
  }

  // READ
  getAllQualifications(): Observable<QualificationFZ[]> {
    return this.http.get<QualificationFZ[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch qualifications');
        console.error('Error fetching qualifications:', err);
        return of([]);
      })
    );
  }

  getQualificationFZById(id: number): Observable<QualificationFZ | undefined> {
    return this.http.get<QualificationFZ>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch qualificationFZ by id');
        console.error(err);
        return of(undefined as unknown as QualificationFZ);
      })
    );
  }

  public refreshQualifications(): void {
    this.loadInitialData();
  }

}