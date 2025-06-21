import { EnvironmentInjector, Injectable, inject } from '@angular/core';
import { Observable, catchError, filter, map, take, throwError, switchMap } from 'rxjs';
import { Title } from '../../../../../Entities/title';
import { TitleService } from '../../../../../Services/title.service';
import { toObservable } from '@angular/core/rxjs-interop';

/**
 * Utility class for title-related business logic and operations.
 * Works with TitleService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' }) 
export class TitleUtils {
  private readonly titleService = inject(TitleService);
  private readonly injector = inject(EnvironmentInjector);

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

  /**
 * Deletes a title by ID and updates the internal titles signal.
 * @param id - ID of the title to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteTitle(id: number): Observable<void> {
    return new Observable(observer => {
      this.titleService.deleteTitle(id);

      setTimeout(() => {
        if (!this.titleService.error()) {
          observer.next();
          observer.complete();
        } else {
          observer.error(this.titleService.error());
        }
      }, 100);
    });
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
      map((currentTitle) => {
        if (!currentTitle) {
          throw new Error('Title not found');
        }
        if (currentTitle.version !== title.version) {
          throw new Error('Version conflict: Title has been updated by another user');
        }
        return title;
      }),
      switchMap((validatedTitle: Title) => this.titleService.updateTitle(validatedTitle)), 
      catchError((err) => {
        console.error('Error updating title:', err);
        return throwError(() => err);
      })
    );
  }

  private waitForUpdatedTitle(id: number, observer: any) {
    return toObservable(this.titleService.titles).pipe(
      map(titles => titles.find(t => t.id === id)),
      filter(updated => !!updated),
      take(1)
    ).subscribe({
      next: (updatedTitle) => {
        observer.next(updatedTitle);
        observer.complete();
      },
      error: (err) => observer.error(err)
    });
  }

  private listenForUpdateErrors(observer: any) {
    return toObservable(this.titleService.error).pipe(
      filter(error => !!error),
      take(1)
    ).subscribe({
      next: (err) => observer.error(err)
    });
  }
}