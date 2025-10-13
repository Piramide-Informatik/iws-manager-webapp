import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Text } from '../Entities/text';

@Injectable({
  providedIn: 'root',
})
export class TextService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/texts`;

  private readonly _texts = signal<Text[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public texts = this._texts.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  constructor() {
    this.loadInitialData();
  }

  private sortAlphabetically(list: Text[]): Text[] {
    return [...list].sort((a, b) => {
      const labelA = a.label || '';
      const labelB = b.label || '';
      return labelA.localeCompare(labelB, undefined, { sensitivity: 'base' });
    });
  }
  loadInitialData(): Observable<Text[]> {
    this._loading.set(true);
    return this.http.get<Text[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (texts) => {
          this._texts.set(texts);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load texts');
          console.error('Error loading texts:', err);
        },
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // ==================== CREATE OPERATIONS ====================
  /**
   * Creates a new text record
   * @param text Text data (without id and timestamps)
   * @returns Observable with the created Text object
   * @throws Error when validation fails or server error occurs
   */
  addText(
    text: Omit<Text, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Observable<Text> {
    return this.http.post<Text>(this.apiUrl, text, this.httpOptions).pipe(
      tap({
        next: (newText) => {
          this._texts.update((texts) => this.sortAlphabetically([...texts, newText]));
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add text');
          console.error('Error adding text:', err);
        },
      })
    );
  }

  // ==================== READ OPERATIONS ====================
  /**
   * Retrieves all texts
   * @returns Observable with Text array
   * @throws Error when server request fails
   */
  getAllTexts(): Observable<Text[]> {
    return this.http.get<Text[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError((err) => {
        this._error.set('Failed to fetch texts');
        console.error('Error fetching texts:', err);
        return of([]);
      })
    );
  }

  /**
   * Retrieves a single text by ID
   * @param id Text identifier
   * @returns Observable with Text object
   * @throws Error when text not found or server error occurs
   */
  getTextById(id: number): Observable<Text | undefined> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.get<Text>(url, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError((err) => {
        this._error.set('Failed to fetch Text');
        console.error('Error fetching Text:', err);
        return of(null as unknown as Text);
      })
    );
  }

  // ==================== UPDATE OPERATIONS ====================
  /**
   * Updates an existing text
   * @param id Text identifier to update
   * @param text Partial text data with updates
   * @returns Observable with updated Text object
   * @throws Error when text not found or validation fails
   */
  updateText(updatedText: Text): Observable<Text> {
    const url = `${this.apiUrl}/${updatedText.id}`;
    return this.http.put<Text>(url, updatedText, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._texts.update((texts) =>
            this.sortAlphabetically(texts.map((t) => (t.id === res.id ? res : t)))
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update text');
          console.error('Error updating text:', err);
        },
      })
    );
  }

  // ==================== DELETE OPERATIONS ====================
  /**
   * Deletes a text record
   * @param id Text identifier to delete
   * @returns Empty Observable
   * @throws Error when text not found or server error occurs
   */
  deleteText(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._texts.update((texts) => texts.filter((s) => s.id !== id));
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete text');
        },
      })
    );
  }

  public refreshTexts(): void {
    this.loadInitialData();
  }
}
