import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { AbsenceType } from '../Entities/absenceType';


@Injectable({
  providedIn: 'root'
})
export class AbsenceTypeService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/absensetypes`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };


  private readonly _absenceTypes = signal<AbsenceType[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);


  public absenceTypes = this._absenceTypes.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  public loadInitialData(): Observable<AbsenceType[]> {
    this._loading.set(true);
    return this.http.get<AbsenceType[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (absenceTypes) => {
          this._absenceTypes.set(absenceTypes);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load absence types');
          console.error('Error loading absence types:', err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addAbsenceType(absenceType: Omit<AbsenceType, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<AbsenceType> {
    return this.http.post<AbsenceType>(this.apiUrl, absenceType, this.httpOptions).pipe(
      tap({
        next: (newAbsenceType) => {
          this._absenceTypes.update(absenceTypes => [...absenceTypes, newAbsenceType]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add absence type');
          console.error('Error adding absence type:', err);
        },
        finalize: () => this._loading.set(false)
      })
    );
  }

  // UPDATE
  updateAbsenceType(updatedAbsenceType: AbsenceType): Observable<AbsenceType> {
    const url = `${this.apiUrl}/${updatedAbsenceType.id}`;
    return this.http.put<AbsenceType>(url, updatedAbsenceType, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._absenceTypes.update(absenceTypes =>
            absenceTypes.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update absence type');
          console.error('Error updating absence type:', err);
        }
      })
    );
  }

  // DELETE
  deleteAbsenceType(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._absenceTypes.update(absenceTypes =>
            absenceTypes.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete absence type');
          console.error('Error deleting absence type:', err);
        }
      })
    );
  }

  // READ
  getAllAbsenceTypes(): Observable<AbsenceType[]> {
    return this.http.get<AbsenceType[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch absence types');
        console.error('Error fetching absence types:', err);
        return of([]);
      })
    );
  }

  getAbsenceTypeById(id: number): Observable<AbsenceType | undefined> {
    return this.http.get<AbsenceType>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch absecnce type by id');
        console.error(err);
        return of(undefined as unknown as AbsenceType);
      })
    );
  }

  public refreshAbsenceTypes(): void {
    this.loadInitialData();
  }
}