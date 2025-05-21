import { inject } from '@angular/core';
import { Observable, catchError, map, throwError, tap } from 'rxjs';
import { Title } from '../../../../../Entities/title';
import { TitleService } from '../../../../../Services/title.service';

/**
 * Utility class for title-related business logic and operations.
 * Works with TitleService's reactive signals while providing additional functionality.
 */
export class TitleUtils {
  private readonly titleService = inject(TitleService);

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
  createNewTitle(nameTitle: string): Observable<void> {
    if (!nameTitle?.trim()) {
      return throwError(() => new Error('Title name cannot be empty'));
    }

    return new Observable<void>(subscriber => {
      this.titleService.addTitle({
        name: nameTitle.trim()
      });

      // Complete the observable after operation
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Checks if a title exists (case-insensitive comparison)
   * @param name - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  titleExists(name: string): Observable<boolean> {
    return this.titleService.getAllTitles().pipe(
      map(titles => titles.some(
        t => t.name.toLowerCase() === name.toLowerCase()
      )),
      catchError(err => {
        console.error('Error checking title existence:', err);
        return throwError(() => new Error('Failed to check title existence'));
      })
    );
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
   * Refreshes titles data
   * @returns Observable that completes when refresh is done
   */
  refreshTitles(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.titleService.refreshTitles();
      subscriber.next();
      subscriber.complete();
    });
  }
}