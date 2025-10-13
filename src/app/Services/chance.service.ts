import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Chance } from '../Entities/chance';

@Injectable({
  providedIn: 'root'
})
export class ChanceService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/chances`;

  private readonly _chances = signal<Chance[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public chances = this._chances.asReadonly();
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

  private sortAlphabetically(list: Chance[]): Chance[] {
  return [...list].sort((a, b) => (a.probability ?? 0) - (b.probability ?? 0));
}

  loadInitialData(): Observable<Chance[]> {
    this._loading.set(true);
    return this.http.get<Chance[]>(this.apiUrl, this.httpOptions).pipe(
       tap({
         next: (chances) => {
           this._chances.set(chances);
           this._error.set(null);
         },
         error: (err) => {
           this._error.set('Failed to load chances');
           console.error('Error loading chances:', err);
         }
       }),
       catchError(() => of([])),
       tap(() => this._loading.set(false))
     )
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new chance record
   * @param chance Chance data (without id and timestamps)
   * @returns Observable with the created Chance object
   * @throws Error when validation fails or server error occurs
   */
  addChance(chance: Omit<Chance, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Chance> {
    return this.http.post<Chance>(this.apiUrl, chance, this.httpOptions).pipe(
      tap({
        next: (newChance) => {
          this._chances.update(chances => this.sortAlphabetically([...chances, newChance]));
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add chance');
          console.error('Error adding chance:', err);
        }
      })
    )
  }

 // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all chances
   * @returns Observable with Chance array
   * @throws Error when server request fails
   */
  getAllChances(): Observable<Chance[]> {
    return this.http.get<Chance[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch chances');
        console.error('Error fetching chances:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single chance by ID
   * @param id Chance identifier
   * @returns Observable with Chance object
   * @throws Error when chance not found or server error occurs
   */
  getChanceById(id: number): Observable<Chance | undefined> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Chance>(url, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError(err => {
        this._error.set('Failed to fetch Chance');
        console.error('Error fetching Chance:', err);
        return of(null as unknown as Chance);
      })
    );
  }  

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing chance
   * @param id Chance identifier to update
   * @param chance Partial chance data with updates
   * @returns Observable with updated Chance object
   * @throws Error when chance not found or validation fails
   */
  updateChance(updatedChance: Chance): Observable<Chance> {
    const url = `${this.apiUrl}/${updatedChance.id}`;
    return this.http.put<Chance>(url, updatedChance, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._chances.update(chances =>
            this.sortAlphabetically(chances.map(t => t.id === res.id ? res : t))
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update chance');
          console.error('Error updating chance:', err);
        }
      })
    );
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a chance record
   * @param id Chance identifier to delete
   * @returns Empty Observable
   * @throws Error when chance not found or server error occurs
   */
  deleteChance(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._chances.update(chances =>
            chances.filter(s => s.id !== id)
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete chance');
        }
      })
    );
  }  

  public refreshChances(): void {
    this.loadInitialData();
  }
}