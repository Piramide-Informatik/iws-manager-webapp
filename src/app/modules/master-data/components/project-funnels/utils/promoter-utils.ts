import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap, map } from 'rxjs';
import { Promoter } from '../../../../../Entities/promoter';
import { PromoterService } from '../../../../../Services/promoter.service';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for promoter-related business logic and operations.
 * Works with PromoterService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class PromoterUtils {
  private readonly promoterService = inject(PromoterService);

  loadInitialData(): Observable<Promoter[]> {
    return this.promoterService.loadInitialData();
  }

  /**
   * Gets a promoter by ID with proper error handling
   * @param id - ID of the promoter to retrieve
   * @returns Observable emitting the promoter or undefined if not found
   */
  getPromoterById(id: number): Observable<Promoter | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid promoter ID'));
    }

    return this.promoterService.getPromoterById(id).pipe(
      catchError(err => {
        console.error('Error fetching promoter:', err);
        return throwError(() => new Error('Failed to load promoter'));
      })
    );
  }

  /**
   * Creates a new promoter with validation
   * @param namePromoter - Name for the new promoter
   * @returns Observable that completes when promoter is created
   */
  addPromoter(promoter: Omit<Promoter, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Promoter> {
    const projectPromoter = promoter.projectPromoter?.trim();
    if (!projectPromoter) {
      return throwError(() => new Error('Abbreviation is required'));
    }

    return this.promoterService.addPromoter(promoter);
  }

  addPromoterWithAutoNumber(promoter: Omit<Promoter, 'id' | 'createdAt' | 'updatedAt' | 'version' | 'promoterNo'>): Observable<Promoter> {
    const projectPromoter = promoter.projectPromoter?.trim();
    if (!projectPromoter) {
      return throwError(() => new Error('Abbreviation is required'));
    }

    return this.promoterService.addPromoterWithAutoNumber(promoter);
  }

  /**
   * Check if promoter abbreviation already exists
   */
  promoterExists(abbreviation: string): Observable<boolean> {
    const cleanAbbreviation = abbreviation?.toString().toLowerCase() || '';

    return this.promoterService.getAllPromoters().pipe(
      map(promoters => promoters.some(
        p => p.projectPromoter?.toString().toLowerCase() === cleanAbbreviation
      )),
      catchError(err => {
        console.error('Error checking promoter existence:', err);
        return throwError(() => new Error('Failed to check promoter existence'));
      })
    );
  }

  /**
   * Gets all promoters
   * @returns Observable emitting sorted array of promoters
   */
  getAllPromoters(): Observable<Promoter[]> {
    return this.promoterService.getAllPromoters();
  }

  getAllPromotersSortedByPromoterName1(): Observable<Promoter[]> {
    return this.promoterService.getAllPromotersSortedByPromoterName1();
  }

  getAllPromotersSortedByPromoterNo(): Observable<Promoter[]> {
    return this.promoterService.getAllPromotersSortedByPromoterNo();
  }

  /**
   * Refreshes customers data
   * @returns Observable that completes when refresh is done
  */
  refreshPromoters(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.promoterService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a promoter by ID and updates the internal promoters signal.
 * @param id - ID of the promoter to delete
 * @returns Observable that completes when the deletion is done
 */
  deletePromoter(id: number): Observable<void> {
    return this.promoterService.deletePromoter(id);
  }

  /**
 * Updates a promoter by ID and updates the internal promoters signal.
 * @param id - ID of the promoter to update
 * @returns Observable that completes when the update is done
 */
  updatePromoter(promoter: Promoter): Observable<Promoter> {
    if (!promoter?.id) {
      return throwError(() => new Error('Invalid promoter data'));
    }
    const projectPromoter = promoter.projectPromoter?.trim();
    if (!projectPromoter) {
      return throwError(() => new Error('Abbreviation is required'));
    }

    return this.promoterService.getPromoterById(promoter.id).pipe(
      take(1),
      switchMap((currentPromoter) => {
        if (!currentPromoter) {
          return throwError(() => createNotFoundUpdateError('Promoter'))
        }
        if (currentPromoter.version !== promoter.version) {
          return throwError(() => createUpdateConflictError('ProjectStatus'));
        }

        return this.promoterService.updatePromoter(promoter);
      }),
      catchError((err) => {
        console.error('Error updating promoter:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Gets the next available promoter number
   * @returns Observable with the next promoter number as string
   */
  getNextPromoterNo(): Observable<string> {
    return this.promoterService.getNextPromoterNo().pipe(
      catchError(err => {
        console.error('Error fetching next promoter number:', err);
        return throwError(() => new Error('Failed to load next promoter number'));
      })
    );
  }
}