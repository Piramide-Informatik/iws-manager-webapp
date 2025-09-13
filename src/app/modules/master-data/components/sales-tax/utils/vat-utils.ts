import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, of } from 'rxjs';
import { InvoiceUtils } from '../../../../invoices/utils/invoice.utils';
import { VatService } from '../../../../../Services/vat.service';
import { Vat } from '../../../../../Entities/vat';

/**
 * Utility class for vat-related business logic and operations.
 * Works with VatService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class VatUtils {
  private readonly vatService = inject(VatService);
  private readonly invoiceUtils = inject(InvoiceUtils);

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
    return this.checkVatUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.vatService.deleteVat(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a vat is used by any invoice.
   * @param idVat - ID of the vat to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkVatUsage(idVat: number): Observable<boolean> {
    return this.invoiceUtils.getAllInvoices().pipe(
      map(invoices => invoices.some(invoice => invoice.vat?.id === idVat)),
      catchError(err => {
        console.error('Error checking vat usage:', err);
        return of(false);
      })
    );
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
      map((currentVat) => {
        if (!currentVat) {
          throw new Error('Vat not found');
        }
        if (currentVat.version !== vat.version) {
          throw new Error('Version conflict: Vat has been updated by another user');
        }
        return vat;
      }),
      switchMap((validatedVat: Vat) => this.vatService.updateVat(validatedVat)),
      catchError((err) => {
        console.error('Error updating vat:', err);
        return throwError(() => err);
      })
    );
  }
}