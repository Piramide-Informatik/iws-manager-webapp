import { Injectable, inject, signal } from '@angular/core';
import { State } from '../Entities/state';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, tap } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class StateService {

  private readonly http = inject(HttpClient);
  private readonly apiUrl = 'assets/data/state.json';

  private readonly _states = signal<State[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);

  public states = this._states.asReadonly();
  public loading = this._loading.asReadonly();
  public error = this._error.asReadonly();

  constructor() {
    this.loadInitialData();
  }

  private loadInitialData(): void {
    this._loading.set(true);
    this.http.get<{ states: State[] }>(this.apiUrl).pipe(
      map(response => response.states),
      tap({
        next: (states) => {
          this._states.set(states);
          this._error.set(null);
        },
        error: (err) => {
          this._error.set('Failed to load states');
          console.error(err);
        }
      }),
      catchError(() => of([])),
      tap(() => this._loading.set(false))
    ).subscribe();
  }

  // CREATE
  addState(state: Omit<State, 'uuidState'>): void {
    const newState: State = {
      ...state,
      uuidState: this.generateUUID()
    };
    this._states.update(states => [...states, newState]);
  }

  // UPDATE
  updateState(updatedState: State): void {
    this._states.update(states =>
      states.map(s => s.uuidState === updatedState.uuidState ? updatedState : s)
    );
  }

  // DELETE
  deleteState(uuidState: string): void {
    this._states.update(states =>
      states.filter(s => s.uuidState !== uuidState)
    );
  }

  // READ
  getAllStates(): Observable<State[]> {
    return this.http.get<{ states: State[] }>(this.apiUrl).pipe(
      map(response => response.states),
      catchError(() => of([]))
    );
  }

  getStateById(id: number): Observable<State | undefined> {
    return this.getAllStates().pipe(
      map(states => states.find(s => s.idState === id))
    );
  }

  // Helper
  private generateUUID(): string {
    return crypto.randomUUID();
  }
}