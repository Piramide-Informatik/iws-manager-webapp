import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, of } from 'rxjs';
import { TextService } from '../../../../../Services/text.service';
import { Text } from '../../../../../Entities/text';

/**
 * Utility class for text-related business logic and operations.
 * Works with TextService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class TextUtils {
  private readonly textService = inject(TextService);

  loadInitialData(): Observable<Text[]> {
    return this.textService.loadInitialData();
  }

  /**
   * Gets a text by ID with proper error handling
   * @param id - ID of the text to retrieve
   * @returns Observable emitting the text or undefined if not found
   */
  getTextById(id: number): Observable<Text | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid text ID'));
    }

    return this.textService.getTextById(id).pipe(
      catchError(err => {
        console.error('Error fetching text:', err);
        return throwError(() => new Error('Failed to load text'));
      })
    );
  }

  /**
   * Creates a new text with validation
   * @param text - New text
   * @returns Observable that completes when text is created
   */
  addText(text: Omit<Text, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Text> {
    return this.textService.addText(text);
  }

  /**
   * Gets all texts
   * @returns Observable emitting sorted array of texts
   */
  getAllTexts(): Observable<Text[]> {
    return this.textService.getAllTexts();
  }

  /**
   * Refreshes texts data
   * @returns Observable that completes when refresh is done
  */
  refreshTexts(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.textService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a text by ID and updates the internal texts signal.
 * @param id - ID of the text to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteText(id: number): Observable<void> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid text ID'));
    }

    return this.textService.deleteText(id).pipe(
      catchError(error => {
        console.error('Error deleting text:', error);
        return throwError(() => new Error('Failed to delete text'));
      })
    );
  }

  /**
 * Updates a text by ID and updates the internal texts signal.
 * @param id - ID of the text to update
 * @returns Observable that completes when the update is done
 */
  updateText(text: Text): Observable<Text> {
    if (!text?.id) {
      return throwError(() => new Error('Invalid text data'));
    }

    return this.textService.getTextById(text.id).pipe(
      take(1),
      map((currentText) => {
        if (!currentText) {
          throw new Error('Text not found');
        }
        if (currentText.version !== text.version) {
          throw new Error('Version conflict: Text has been updated by another user');
        }
        return text;
      }),
      switchMap((validatedText: Text) => this.textService.updateText(validatedText)),
      catchError((err) => {
        console.error('Error updating text:', err);
        return throwError(() => err);
      })
    );
  }
}