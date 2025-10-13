import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap } from 'rxjs';
import { VatRateService } from '../../../../../Services/vat-rate.service';
import { VatRate } from '../../../../../Entities/vatRate';
import { Vat } from '../../../../../Entities/vat';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for vatRate-related business logic and operations.
 * Works with VatRateService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class VatRateUtils {
  private readonly vatRateService = inject(VatRateService);

  loadInitialData(): Observable<VatRate[]> {
    return this.vatRateService.loadInitialData();
  }

  /**
   * Gets a vatRate by ID with proper error handling
   * @param id - ID of the vatRate to retrieve
   * @returns Observable emitting the vatRate or undefined if not found
   */
  getVatRateById(id: number): Observable<VatRate | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid vatRate ID'));
    }

    return this.vatRateService.getVatRateById(id).pipe(
      catchError(err => {
        console.error('Error fetching vatRate:', err);
        return throwError(() => new Error('Failed to load vatRate'));
      })
    );
  }

  /**
  * Gets all vat rates given a vat
  * @param vatId - Vat to get his vatRates
  * @returns Observable emitting the raw list of vatRates
  */
  getAllVatRatesByVatId(vatId: number): Observable<VatRate[]> {
    return this.vatRateService.getAllVatRatesByVatId(vatId).pipe(
      catchError(() => throwError(() => new Error('Failed to load vatRates by vat')))
    );
  }

  /**
   * Creates a new vatRate with validation
   * @param vatRate - New vatRate
   * @returns Observable that completes when vatRate is created
   */
  addVatRate(vatRate: Omit<VatRate, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<VatRate> {
    return this.vatRateService.addVatRate(vatRate);
  }

  /**
   * Gets all vatRates
   * @returns Observable emitting sorted array of vatRates
   */
  getAllVatRates(): Observable<VatRate[]> {
    return this.vatRateService.getAllVatRates();
  }

  /**
   * Refreshes vatRates data
   * @returns Observable that completes when refresh is done
  */
  refreshVatRates(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.vatRateService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a vatRate by ID and updates the internal vatRates signal.
 * @param id - ID of the vatRate to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteVatRate(id: number): Observable<void> {
    return this.vatRateService.deleteVatRate(id).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
 * Updates a vatRate by ID and updates the internal vatRates signal.
 * @param id - ID of the vatRate to update
 * @returns Observable that completes when the update is done
 */
  updateVatRate(vatRate: VatRate): Observable<VatRate> {
    if (!vatRate?.id) {
      return throwError(() => new Error('Invalid vatRate data'));
    }

    return this.vatRateService.getVatRateById(vatRate.id).pipe(
      take(1),
      switchMap((currentVatRate) => {
        if (!currentVatRate) {
          return throwError(() => createNotFoundUpdateError('VatRate'));
        }
        if (currentVatRate.version !== vatRate.version) {
          return throwError(() => createUpdateConflictError('VatRate'));
        }
        return this.vatRateService.updateVatRate(vatRate);
      }),
      catchError((err) => {
        console.error('Error updating vatRate:', err);
        return throwError(() => err);
      })
    );
  }

  calculateCurrentRateForVat(vat: Vat, vatRates: VatRate[]): number | undefined {
    if (!vatRates || vatRates.length === 0) return undefined;

    const ratesForVat = vatRates.filter(vr => vr.vat?.id === vat.id);
    if (ratesForVat.length === 0) return undefined;

    const today = new Date();
    const sortedRates = [...ratesForVat].sort(
      (a, b) => new Date(a.fromdate!).getTime() - new Date(b.fromdate!).getTime()
    );

    let currentRate: number | undefined = undefined;
    for (const rate of sortedRates) {
      if (rate.fromdate && new Date(rate.fromdate) <= today) {
        currentRate = rate.rate ?? undefined;
      }
    }

    return currentRate;
  }
}