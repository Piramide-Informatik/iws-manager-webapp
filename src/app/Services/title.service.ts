import { Injectable, inject, signal } from '@angular/core';
import { Title } from '../Entities/title';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TitleService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'assets/data/title.json';

  private readonly _titles = signal<Title[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public titles = this._titles.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this._loading.set(true);
    this.http.get<{ titles: Title[] }>(this.apiUrl).pipe(
      map(response => response.titles),
      tap({
        next: (titles) => {
          this._titles.set(titles);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load titles');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    ).subscribe();
  }

  // CREATE
  addTitle(title: Omit<Title, 'uuidTitle'>): void {
    const newTitle: Title = {
      ...title,
      uuidTitle: this.generateUUID()
    };
    this._titles.update(titles => [...titles, newTitle]);
  }

  // UPDATE
  updateTitle(updatedTitle: Title): void {
    this._titles.update(titles =>
      titles.map(t => t.uuidTitle === updatedTitle.uuidTitle ? updatedTitle : t)
    );
  }

  // DELETE
  deleteTitle(uuidTitle: string): void {
    this._titles.update(titles =>
      titles.filter(t => t.uuidTitle !== uuidTitle)
    );
  }

  // READ
  getAllTitles(): Observable<Title[]> {
    return this.http.get<{ titles: Title[] }>(this.apiUrl).pipe(
      map(response => response.titles),
      catchError(() => of([]))
    );
  }

  getTitleById(id: number): Observable<Title | undefined> {
    return this.getAllTitles().pipe(
      map(titles => titles.find(t => t.idTitle === id))
    );
  }

  // Helper
  private generateUUID(): string {
    return crypto.randomUUID();
  }
}