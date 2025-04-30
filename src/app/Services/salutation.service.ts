import { Injectable, inject, signal } from '@angular/core';
import { Salutation } from '../Entities/salutation.model';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class SalutationService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'assets/data/salutation.json';

  private readonly _salutations = signal<Salutation[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public salutations = this._salutations.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this._loading.set(true);
    this.http.get<{ salutations: Salutation[] }>(this.apiUrl).pipe(
      map(response => response.salutations),
      tap({
        next: (salutations) => {
          this._salutations.set(salutations);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load salutations');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    ).subscribe();
  }

  // Get all salutations
  getAllSalutations(): Observable<Salutation[]> {
    return this.http.get<{ salutations: Salutation[] }>(this.apiUrl).pipe(
      map(response => response.salutations),
      catchError(() => of([]))
    );
  }

  //Get a salutation by id munber
  getSalutationById(uuid: string): Observable<Salutation | undefined> {
    return this.getAllSalutations().pipe(
      map(salutations => salutations.find(s => s.uuid === uuid))
    );
  }

}