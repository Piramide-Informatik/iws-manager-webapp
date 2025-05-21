import { Injectable, inject, signal } from '@angular/core';
import { Title } from '../Entities/title';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError, finalize } from 'rxjs';
import { environment } from '../../environments/environment';

/**
 * Service for managing title operations (CRUD) and state management.
 * Uses Angular Signals for reactive state management and HttpClient for API communication.
 * 
 * @providedIn: 'root' - Service is application-wide singleton
 */
@Injectable({
  providedIn: 'root'
})
export class TitleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/titles`;

  /** Default HTTP options for all requests */
  private readonly httpOptions = {
    withCredentials: true,
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Access-Control-Allow-Origin': 'http://localhost:4200'
    })
  };

  // Reactive state using signals
  private readonly _titles = signal<Title[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  // Public read-only signals
  /** Observable list of titles */
  public readonly titles = this._titles.asReadonly();
  /** Loading state observable */
  public readonly loading = this._loading.asReadonly();
  /** Error state observable */
  public readonly error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  /**
   * Initial data loading on service initialization
   * @private
   */
  private loadInitialData(): void {
    this._loading.set(true);
    this.http.get<Title[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (titles) => {
          this._titles.set(titles);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load titles');
          console.error('Error loading titles:', err);
        }
      }),
      catchError(() => of([])), // Fail gracefully
      finalize(() => this._loading.set(false))
    ).subscribe();
  }

  // ----------------- CRUD Operations ----------------- //

  /**
   * Creates a new title
   * @param {Omit<Title, 'id' | 'createdAt' | 'updatedAt'>} title - Title data without auto-generated fields
   * @emits Updates _titles signal on success
   * @emits Updates _error signal on failure
   */
  addTitle(title: Omit<Title, 'id' | 'createdAt' | 'updatedAt'>): void {
    this._loading.set(true);
    this.http.post<Title>(this.apiUrl, title, this.httpOptions).pipe(
      tap({
        next: (newTitle) => {
          this._titles.update(titles => [...titles, newTitle]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add title');
          console.error('Error adding title:', err);
        }
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }

  /**
   * Updates an existing title
   * @param {Title} updatedTitle - Complete title object with updated values
   * @emits Updates _titles signal on success
   * @emits Updates _error signal on failure
   */
  updateTitle(updatedTitle: Title): void {
    const url = `${this.apiUrl}/${updatedTitle.id}`;
    this._loading.set(true);
    this.http.put<Title>(url, updatedTitle, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._titles.update(titles => 
            titles.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update title');
          console.error('Error updating title:', err);
        }
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }

  /**
   * Deletes a title by ID
   * @param {number} id - ID of the title to delete
   * @emits Updates _titles signal on success
   * @emits Updates _error signal on failure
   */
  deleteTitle(id: number): void {
    const url = `${this.apiUrl}/${id}`;
    this._loading.set(true);
    this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._titles.update(titles => 
            titles.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete title');
          console.error('Error deleting title:', err);
        }
      }),
      finalize(() => this._loading.set(false))
    ).subscribe();
  }

  // ----------------- Read Operations ----------------- //

  /**
   * Fetches all titles (alternative to signal-based approach)
   * @returns {Observable<Title[]>} Observable of titles array
   * @emits Updates _error signal on failure
   */
  getAllTitles(): Observable<Title[]> {
    this._loading.set(true);
    return this.http.get<Title[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch titles');
        console.error('Error fetching titles:', err);
        return throwError(() => err);
      }),
      finalize(() => this._loading.set(false))
    );
  }

  /**
   * Gets a single title by ID
   * @param {number} id - Title ID to search for
   * @returns {Observable<Title | undefined>} Observable with found title or undefined
   */
  getTitleById(id: number): Observable<Title | undefined> {
    return this.getAllTitles().pipe(
      map(titles => titles.find(t => t.id === id))
    );
  }

  /**
   * Forces a refresh of titles data
   * @emits Updates all related signals
   */
  public refreshTitles(): void {
    this.loadInitialData();
  }
}