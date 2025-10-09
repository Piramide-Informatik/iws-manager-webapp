import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { System } from '../Entities/system';

@Injectable({
  providedIn: 'root'
})
export class SystemConstantService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/systems`;
  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    })
  };

  private readonly _systems = signal<System[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public systems = this._systems.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();


  public loadInitialData(): Observable<System[]> {
    this._loading.set(true);
    return this.http.get<System[]>(this.apiUrl).pipe(
      tap({
        next: (systems) => {
          this._systems.set(systems);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load systems constants');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    )
  }

  // CREATE
  addSystemConstant(systemConstant: Omit<System, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<System> {
    return this.http.post<System>(this.apiUrl, systemConstant, this.httpOptions).pipe(
      tap({
        next: (newSystemConstant) => {
          this._systems.update(systems => [...systems, newSystemConstant]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add systems constants');
          console.error('Error adding systems constants:', err);
        }
      })
    )
  }

  // UPDATE
  updateSystemConstant(updateSystemConstant: System): Observable<System> {
    const url = `${this.apiUrl}/${updateSystemConstant.id}`;
    return this.http.put<System>(url, updateSystemConstant, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._systems.update(systems => 
            systems.map(sc => sc.id === res.id ? res : sc)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update systems constants');
          console.error('Error updating systems constants:', err);
        }
      })
    );
  }

  // DELETE
  deleteSystemConstant(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._systems.update(systems => 
            systems.filter(sc => sc.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to systems constants');
          console.error('Error systems constants', err);
        }
      })
    );
  }

  getSystemConstantById(id: number): Observable<System | undefined> {
    return this.http.get<System>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch system constant by id');
        console.error(err);
        return of(undefined as unknown as System);
      })
    );
  }
}
