import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap, of, map } from 'rxjs';
import { VatService } from '../../../../../Services/vat.service';
import { Vat } from '../../../../../Entities/vat';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for vat-related business logic and operations.
 * Works with VatService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class VatUtils {
  private readonly vatService = inject(VatService);

  loadInitialData(): Observable<Vat[]> {
    return this.vatService.loadInitialData();
  }

  /**
   * Gets a vat by ID with proper error handling
   * @param id - ID of the vat to retrieve
   * @returns Observable emitting the vat or undefined if not found
   */
  getVatById(id: number): Observable<Vat | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid vat ID'));
    }

    return this.vatService.getVatById(id).pipe(
      catchError(err => {
        console.error('Error fetching vat:', err);
        return throwError(() => new Error('Failed to load vat'));
      })
    );
  }

  /**
   * Creates a new vat with validation
   * @param vat - New vat
   * @returns Observable that completes when vat is created
   */
  addVat(vat: Omit<Vat, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Vat> {
    return this.vatService.addVat(vat);
  }

  /**
   * Gets all vats
   * @returns Observable emitting sorted array of vats
   */
  getAllVats(): Observable<Vat[]> {
    return this.vatService.getAllVats();
  }

  /**
   * Refreshes vats data
   * @returns Observable that completes when refresh is done
  */
  refreshVats(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.vatService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a vat by ID and updates the internal vats signal.
 * @param id - ID of the vat to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteVat(id: number): Observable<void> {
    return this.vatService.deleteVat(id);
  }

  /**
 * Updates a vat by ID and updates the internal vats signal.
 * @param id - ID of the vat to update
 * @returns Observable that completes when the update is done
 */
  updateVat(vat: Vat): Observable<Vat> {
    if (!vat?.id) {
      return throwError(() => new Error('Invalid vat data'));
    }

    return this.vatService.getVatById(vat.id).pipe(
      take(1),
      switchMap((currentVat) => {
        if (!currentVat) {
          return throwError(() => createNotFoundUpdateError('Vat'));
        }
        if (currentVat.version !== vat.version) {
          return throwError(() => createUpdateConflictError('Vat'));
        }
        return this.vatService.updateVat(vat);
      }),
      catchError((err) => {
        console.error('Error updating vat:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * NEW: Checks if a vat label already exists
   * @param label - Label to check
   * @param excludeId - ID to exclude from check (for updates)
   * @returns Observable emitting boolean (true if label exists)
   */
  checkVatLabelExists(label: string, excludeId?: number): Observable<boolean> {
    const trimmedLabel = label.trim().toLowerCase();
    return this.vatService.getAllVats().pipe(
      take(1),
      map(vats => {
        return vats.some(vat => 
          vat.label?.toLowerCase() === trimmedLabel && 
          (!excludeId || vat.id !== excludeId)
        );
      })
    );
  }
}