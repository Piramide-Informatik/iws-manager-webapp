import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, map, of, tap, throwError } from 'rxjs';
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

  private loadInitialData(): void {
    this._loading.set(true);
    this.http.get<Country[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (countries) => {
          this._countries.set(countries);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load countries');
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    ).subscribe();
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new country record
   * @param country Country data (without id and timestamps)
   * @returns Observable with the created Country object
   * @throws Error when validation fails or server error occurs
   */
  addCountry(country: Omit<Country, 'id' | 'createdAt' | 'updatedAt'>): void {
    this.http.post<Country>(this.apiUrl, country, this.httpOptions).pipe(
      tap({
        next: (newCountry) => {
          this._countries.update(countries => [...countries, newCountry]);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add country');
          console.error('Error adding country:', err);
        }
      })
    ).subscribe();
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
   * Retrieves all countries sorted alphabetically by name
   * @returns Observable with Country array sorted by name
   * @throws Error when server request fails
   */
  getAllCountriesSortedByName(): Observable<Country[]> {
    return this.getAllCountries().pipe(
      map((countries: Country[]) => {
        if (!Array.isArray(countries)) {
          return [];
        }
        // Filtra los países con nombre válido y ordena alfabéticamente
        return countries
          .filter(country => !!country.name && country.name.trim() !== '')
          .sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
      }),
      catchError(err => {
        this._error.set('Failed to sort countries');
        console.error('Error sorting countries:', err);
        return throwError(() => new Error('Failed to sort countries'));
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
    return this.getAllCountries().pipe(
      map(countries => countries.find(t => t.id === id))
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
  updateCountry(updatedCountry: Country): void {
    const url = `${this.apiUrl}/${updatedCountry.id}`;
    this.http.put<Country>(url, updatedCountry, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._countries.update(countries =>
            countries.map(t => t.id === res.id ? res : t)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update country');
          console.error('Error updating country:', err);
        }
      })
    ).subscribe();
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a country record
   * @param id Country identifier to delete
   * @returns Empty Observable
   * @throws Error when country not found or server error occurs
   */
  deleteCountry(id: number): void {
    const url = `${this.apiUrl}/${id}`;
    this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._countries.update(countries =>
            countries.filter(t => t.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete country');
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

  public refreshCountries(): void {
    this.loadInitialData();
  }
}