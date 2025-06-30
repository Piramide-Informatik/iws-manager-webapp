import { Injectable, inject, signal } from '@angular/core';
import { State } from '../Entities/state';
import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError  } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/states`;

  private readonly _states = signal<State[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public states = this._states.asReadonly();
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

  private loadInitialData(): void {
    this._loading.set(true);
     this.http.get<State[]>(this.apiUrl, this.httpOptions).pipe(
       tap({
         next: (states) => {
           this._states.set(states);
           this._error.set(null);
         },
         error: (err) => {
           this._error.set('Failed to load states');
           console.error('Error loading states:', err);
         }
       }),
       catchError(() => of([])),
       tap(() => this._loading.set(false))
     ).subscribe();
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new state record
   * @param state State data (without id and timestamps)
   * @returns Observable with the created State object
   * @throws Error when validation fails or server error occurs
   */
  addState(state: Omit<State, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.http.post<State>(this.apiUrl, state, this.httpOptions).pipe(
      tap({
        next: (newState) => {
          this._states.update(states => [...states, newState]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add state');
          console.error('Error adding state:', err);
        }
      })
    ).subscribe();
  }

 // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all states
   * @returns Observable with State array
   * @throws Error when server request fails
   */
  getAllStates(): Observable<State[]> {
    return this.http.get<State[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch states');
        console.error('Error fetching states:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single state by ID
   * @param id State identifier
   * @returns Observable with State object
   * @throws Error when state not found or server error occurs
   */
  getStateById(id: number): Observable<State | undefined> {
    return this.getAllStates().pipe(
      map(states => states.find(t => t.id === id))
    );
  }  

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing state
   * @param id State identifier to update
   * @param state Partial state data with updates
   * @returns Observable with updated State object
   * @throws Error when state not found or validation fails
   */
  updateState(updatedState: State): Observable<State> {
    const url = `${this.apiUrl}/${updatedState.id}`;
    return this.http.put<State>(url, updatedState, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._states.update(states =>
            states.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update state');
          console.error('Error updating state:', err);
        }
      })
    );
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a state record
   * @param id State identifier to delete
   * @returns Empty Observable
   * @throws Error when state not found or server error occurs
   */
  deleteState(id: number): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._states.update(states =>
            states.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete state');
        }
      })
    ).subscribe();
  }  

  // ==================== ERROR HANDLING ====================
  /**
   * Handles HTTP errors consistently across all requests
   * @param error HttpErrorResponse object
   * @returns Error observable with user-friendly message
   * @private
   */
  private handleError(error: HttpErrorResponse) {
    const errorMessage = error.error?.message ??
      error.statusText ??
      'Unknown server error';

    return throwError(() => new Error(errorMessage));
  }

    public refreshStates(): void {
    this.loadInitialData();
  }
}