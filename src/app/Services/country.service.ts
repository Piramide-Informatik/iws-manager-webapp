import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, finalize, of, tap, throwError } from 'rxjs';
import { Country } from '../Entities/country';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CountryService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/countries`;

  // Signals
  private readonly _countries = signal<Country[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public countries = this._countries.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private readonly httpOptions = {
    //  withCredentials: true,
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    })
  };

  constructor() {
    this.loadInitialData();
  }

  private sortAlphabetically(list: Country[]): Country[] {
    return [...list].sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
  }

  public loadInitialData(): Observable<Country[]> {
    this._loading.set(true);
    return this.http.get<Country[]>(this.apiUrl, this.httpOptions).pipe(
      tap(countries => {
        this._countries.set(countries);
        this._error.set(null);
      }),
      catchError(() => of([])),
      finalize(() => this._loading.set(false))
    );
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new country record
   * @param country Country data (without id and timestamps)
   * @returns Observable with the created Country object
   * @throws Error when validation fails or server error occurs
   */
  addCountry(country: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>): Observable<Country> {
    return this.http.post<Country>(this.apiUrl, country, this.httpOptions).pipe(
      tap({
        next: (newCountry) => {
          this._countries.update(countries => this.sortAlphabetically([...countries, newCountry]));
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add country');
          console.error('Error adding country:', err);
        }
      })
    )
  }

  /**
 * Creates a new country with automatic default handling
 * If the new country is set as default, other countries will be updated to non-default
 * @param country Country data (without id and timestamps)
 * @returns Observable with the created Country object
 * @throws Error when validation fails or server error occurs
 */
  addCountryWithDefaultHandling(country: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>): Observable<Country> {
    const createUrl = `${this.apiUrl}/with-default-handling`;

    return this.http.post<Country>(createUrl, country, this.httpOptions).pipe(
      tap({
        next: (newCountry) => {
          this._countries.update(countries => this.sortAlphabetically([...countries, newCountry]));
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add country with default handling');
          console.error('Error adding country with default handling:', err);
        }
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all countries
   * @returns Observable with Country array
   * @throws Error when server request fails
   */
  getAllCountries(): Observable<Country[]> {
    return this.http.get<Country[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch countries');
        console.error('Error fetching countries:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single country by ID
   * @param id Country identifier
   * @returns Observable with Country object
   * @throws Error when country not found or server error occurs
   */
  getCountryById(id: number): Observable<Country | undefined> {
    return this.http.get<Country>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch country by id');
        console.error(err);
        return of(undefined as unknown as Country);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing country
   * @param id Country identifier to update
   * @param country Partial country data with updates
   * @returns Observable with updated Country object
   * @throws Error when country not found or validation fails
   */
  updateCountry(updatedCountry: Country): Observable<Country> {
    const url = `${this.apiUrl}/${updatedCountry.id}/with-default-handling`;
    return this.http.put<Country>(url, updatedCountry, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._countries.update(countries =>
            this.sortAlphabetically(countries.map(t => t.id === res.id ? res : t))
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update country');
          console.error('Error updating country:', err);
        }
      })
    );
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a country record
   * @param id Country identifier to delete
   * @returns Empty Observable
   * @throws Error when country not found or server error occurs
   */
  deleteCountry(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._countries.update(countries =>
            countries.filter(c => c.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete country');
        }
      })
    );
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

  public refreshCountries(): void {
    this.loadInitialData();
  }
}