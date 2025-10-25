import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap } from 'rxjs';
import { Title } from '../../../../../Entities/title';
import { TitleService } from '../../../../../Services/title.service';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for title-related business logic and operations.
 * Works with TitleService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class TitleUtils {
  private readonly titleService = inject(TitleService);

  loadInitialData(): Observable<Title[]> {
    return this.titleService.loadInitialData();
  }

  /**
   * Gets a title by ID with proper error handling
   * @param id - ID of the title to retrieve
   * @returns Observable emitting the title or undefined if not found
   */
  getTitleById(id: number): Observable<Title | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid title ID'));
    }

    return this.titleService.getTitleById(id).pipe(
      catchError(err => {
        console.error('Error fetching title:', err);
        return throwError(() => new Error('Failed to load title'));
      })
    );
  }

  /**
   * Creates a new title with validation
   * @param nameTitle - Name for the new title
   * @returns Observable that completes when title is created
   */

  addTitle(nameTitle: string): Observable<Title> {
    return this.titleService.addTitle({name: nameTitle});
  }

  getAllTitles(): Observable<Title[]> {
    return this.titleService.getAllTitles();
  }

  /**
   * Gets all titles sorted alphabetically by name
   * @returns Observable emitting sorted array of titles
   */
  getTitlesSortedByName(): Observable<Title[]> {
    return this.titleService.getAllTitles().pipe(
      map(titles => [...titles].sort((a, b) => a.name.localeCompare(b.name))),
      catchError(err => {
        console.error('Error sorting titles:', err);
        return throwError(() => new Error('Failed to sort titles'));
      })
    );
  }

  /**
     * Refreshes customers data
     * @returns Observable that completes when refresh is done
     */
  refreshTitles(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.titleService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a title by ID and updates the internal titles signal.
 * @param id - ID of the title to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteTitle(id: number): Observable<void> {
    return this.titleService.deleteTitle(id)      
  }

  /**
 * Updates a title by ID and updates the internal titles signal.
 * @param id - ID of the title to update
 * @returns Observable that completes when the update is done
 */
  updateTitle(title: Title): Observable<Title> {
    if (!title?.id) {
      return throwError(() => new Error('Invalid title data'));
    }

    return this.titleService.getTitleById(title.id).pipe(
      take(1),
      switchMap((currentTitle) => {
        if (!currentTitle) {
          return throwError(() => createNotFoundUpdateError('Title'));
        }
        if (currentTitle.version !== title.version) {
          return throwError(() => createUpdateConflictError('Title'));
        }
        return this.titleService.updateTitle(title);

      }),
      catchError((err) => {
        console.error('Error updating title:', err);
        return throwError(() => err);
      })
    );
  }
}