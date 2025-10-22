import { Injectable, inject } from '@angular/core';
import { Observable, catchError, switchMap, take, throwError } from 'rxjs';
import { StateService } from '../../../../../Services/state.service';
import { State } from '../../../../../Entities/state';
import { createNotFoundUpdateError, createUpdateConflictError, createNotFoundDeleteError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for state-related business logic and operations.
 * Works with StateService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class StateUtils {
  private readonly stateService = inject(StateService);

  loadInitialData(): Observable<State[]> {
    return this.stateService.loadInitialData();
  }

  /**
   * Gets a state by ID with proper error handling
   * @param id - ID of the state to retrieve
   * @returns Observable emitting the state or undefined if not found
   */
  getStateById(id: number): Observable<State | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid state ID'));
    }

    return this.stateService.getStateById(id).pipe(
      catchError(err => {
        console.error('Error fetching state:', err);
        return throwError(() => new Error('Failed to load state'));
      })
    );
  }

  /**
   * Creates a new state with validation
   * @param nameState - Name for the new state
   * @returns Observable that completes when state is created
   */
  createNewState(nameState: string): Observable<State> {
    if (!nameState?.trim()) {
      return throwError(() => new Error('State name cannot be empty'));
    }

    return this.stateService.addState({
      name: nameState.trim()
    });
  }

  /**
   * Checks if a state exists (case-insensitive comparison)
   * @param name - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  stateExists(name: string): Observable<boolean> {
    return this.stateService.getAllStates().pipe(
      switchMap(states => [states.some(s => s.name.toLowerCase() === name.toLowerCase())]),
      catchError(err => {
        console.error('Error checking state existence:', err);
        return throwError(() => new Error('Failed to check state existence'));
      })
    );
  }

  /**
   * Gets all states sorted alphabetically by name
   * @returns Observable emitting sorted array of states
   */
  getStatesSortedByName(): Observable<State[]> {
    return this.stateService.getAllStates().pipe(
      switchMap(states => [[...states].sort((a, b) => a.name.localeCompare(b.name))]),
      catchError(err => {
        console.error('Error sorting states:', err);
        return throwError(() => new Error('Failed to sort states'));
      })
    );
  }

  /**
   * Refreshes states data
   * @returns Observable that completes when refresh is done
   */
  refreshStates(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.stateService.refreshStates();
      subscriber.next();
      subscriber.complete();
    });
  }

  deleteState(id: number): Observable<void> {
    return this.stateService.deleteState(id);
  }

  updateState(state: State): Observable<State> {
    if (!state?.id) {
      return throwError(() => new Error('Invalid state data'));
    }

    return this.stateService.getStateById(state.id).pipe(
      take(1),
      switchMap((currentState) => {
        if (!currentState) {
          return throwError(() => createNotFoundUpdateError('State'));
        }
        if (currentState.version !== state.version) {
          return throwError(() => createUpdateConflictError('State'));
        }
        return this.stateService.updateState(state);
      }),
      catchError((err) => {
        console.error('Error updating state:', err);
        return throwError(() => err);
      })
    );
  }
}