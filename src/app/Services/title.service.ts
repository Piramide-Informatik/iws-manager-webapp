import { Injectable, inject, signal } from '@angular/core';
import { Title } from '../Entities/title';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, catchError, of, tap } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class TitleService {
  private readonly http = inject(HttpClient);
  private readonly apiUrl = `${environment.BACK_END_HOST_DEV}/titles`;

  private readonly httpOptions = {
    headers: new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
    }),
  };

  private readonly _titles = signal<Title[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public titles = this._titles.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  private sortAlphabetically(list: Title[]): Title[] {
    return [...list].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );
  }
  public loadInitialData(): Observable<Title[]> {
    this._loading.set(true);
    return this.http.get<Title[]>(this.apiUrl, this.httpOptions).pipe(
      tap({
        next: (titles) => {
          this._titles.set(titles);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load titles');
          console.error('Error loading titles:', err);
        },
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    );
  }

  // CREATE
  addTitle(
    title: Omit<Title, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Observable<Title> {
    return this.http.post<Title>(this.apiUrl, title, this.httpOptions).pipe(
      tap({
        next: (newTitle) => {
          this._titles.update((titles) => this.sortAlphabetically([...titles, newTitle]));
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to add title');
          console.error('Error adding title:', err);
        },
        finalize: () => this._loading.set(false),
      })
    );
  }

  // UPDATE
  updateTitle(updatedTitle: Title): Observable<Title> {
    const url = `${this.apiUrl}/${updatedTitle.id}`;
    return this.http.put<Title>(url, updatedTitle, this.httpOptions).pipe(
      tap({
        next: (res) => {
          this._titles.update((titles) =>
            this.sortAlphabetically(titles.map((t) => (t.id === res.id ? res : t)))
          );
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to update title');
          console.error('Error updating title:', err);
        },
      })
    );
  }

  // DELETE
  deleteTitle(id: number): Observable<void> {
    const url = `${this.apiUrl}/${id}`;
    return this.http.delete<void>(url, this.httpOptions).pipe(
      tap({
        next: () => {
          this._titles.update((titles) => titles.filter((t) => t.id !== id));
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to delete title');
          console.error('Error deleting title:', err);
        },
      })
    );
  }

  // READ
  getAllTitles(): Observable<Title[]> {
    return this.http.get<Title[]>(this.apiUrl, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError((err) => {
        this._error.set('Failed to fetch titles');
        console.error('Error fetching titles:', err);
        return of([]);
      })
    );
  }

  getTitleById(id: number): Observable<Title | undefined> {
    return this.http.get<Title>(`${this.apiUrl}/${id}`, this.httpOptions).pipe(
      tap(() => this._error.set(null)),
      catchError((err) => {
        this._error.set('Failed to fetch title by id');
        console.error(err);
        return of(undefined as unknown as Title);
      })
    );
  }

  public refreshTitles(): void {
    this.loadInitialData();
  }
}
