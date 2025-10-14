import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, of } from 'rxjs';
import { BillerService } from '../../../../../Services/biller.service';
import { InvoiceUtils } from '../../../../invoices/utils/invoice.utils';
import { Biller } from '../../../../../Entities/biller';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for biller-related business logic and operations.
 * Works with BillerService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class BillerUtils {
  private readonly billerService = inject(BillerService);
  private readonly invoiceUtils = inject(InvoiceUtils);

  loadInitialData(): Observable<Biller[]> {
    return this.billerService.loadInitialData();
  }

  /**
   * Gets a biller by ID with proper error handling
   * @param id - ID of the biller to retrieve
   * @returns Observable emitting the biller or undefined if not found
   */
  getBillerById(id: number): Observable<Biller | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid biller ID'));
    }

    return this.billerService.getBillerById(id).pipe(
      catchError(err => {
        console.error('Error fetching biller:', err);
        return throwError(() => new Error('Failed to load biller'));
      })
    );
  }

  /**
   * Creates a new biller with validation
   * @param biller - New biller
   * @returns Observable that completes when biller is created
   */
  addBiller(biller: Omit<Biller, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Biller> {
    return this.billerService.addBiller(biller);
  }

  /**
   * Gets all billers
   * @returns Observable emitting sorted array of billers
   */
  getAllBillers(): Observable<Biller[]> {
    return this.billerService.getAllBillers();
  }

  /**
   * Refreshes billers data
   * @returns Observable that completes when refresh is done
  */
  refreshBillers(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.billerService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a biller by ID and updates the internal billers signal.
 * @param id - ID of the biller to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteBiller(id: number): Observable<void> {
    return this.checkBillerUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.billerService.deleteBiller(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a biller is used by any invoice.
   * @param idBiller - ID of the biller to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkBillerUsage(idBiller: number): Observable<boolean> {
    return this.invoiceUtils.getAllInvoices().pipe(
      map(invoices => invoices.some(invoice => invoice.biller?.id === idBiller)),
      catchError(err => {
        console.error('Error checking biller usage:', err);
        return of(false);
      })
    );
  }

  /**
 * Updates a biller by ID and updates the internal billers signal.
 * @param id - ID of the biller to update
 * @returns Observable that completes when the update is done
 */
  updateBiller(biller: Biller): Observable<Biller> {
    if (!biller?.id) {
      return throwError(() => new Error('Invalid biller data'));
    }

    return this.billerService.getBillerById(biller.id).pipe(
      take(1),
      switchMap((currentBiller) => {
        if (!currentBiller) {
          return throwError(() => createNotFoundUpdateError('Biller'));
        }
        if (currentBiller.version !== biller.version) {
          return throwError(() => createUpdateConflictError('Biller'));
        }
        return this.billerService.updateBiller(biller);
      }),
      catchError((err) => {
        console.error('Error updating biller:', err);
        return throwError(() => err);
      })
    );
  }
}