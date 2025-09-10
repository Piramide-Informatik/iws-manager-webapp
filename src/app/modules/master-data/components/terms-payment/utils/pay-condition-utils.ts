import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, of } from 'rxjs';
import { InvoiceUtils } from '../../../../invoices/utils/invoice.utils';
import { PayCondition } from '../../../../../Entities/payCondition';
import { PayConditionService } from '../../../../../Services/pay-condition.service';

/**
 * Utility class for payCondition-related business logic and operations.
 * Works with PayConditionService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class PayConditionUtils {
  private readonly payConditionService = inject(PayConditionService);
  private readonly invoiceUtils = inject(InvoiceUtils);

  loadInitialData(): Observable<PayCondition[]> {
    return this.payConditionService.loadInitialData();
  }

  /**
   * Gets a pay condition by ID with proper error handling
   * @param id - ID of the pay condition to retrieve
   * @returns Observable emitting the pay condition or undefined if not found
   */
  getPayConditionById(id: number): Observable<PayCondition | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid pay condition ID'));
    }

    return this.payConditionService.getPayConditionById(id).pipe(
      catchError(err => {
        console.error('Error fetching pay condition:', err);
        return throwError(() => new Error('Failed to load pay condition'));
      })
    );
  }

  /**
   * Creates a new pay condition with validation
   * @param payCondition - New pay condition
   * @returns Observable that completes when pay condition is created
   */
  addPayCondition(payCondition: Omit<PayCondition, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<PayCondition> {
    return this.payConditionService.addPayCondition(payCondition);
  }

  /**
   * Gets all pay conditions
   * @returns Observable emitting sorted array of pay conditions
   */
  getAllPayConditions(): Observable<PayCondition[]> {
    return this.payConditionService.getAllPayConditions();
  }

  /**
   * Refreshes customers data
   * @returns Observable that completes when refresh is done
  */
  refreshPayConditions(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.payConditionService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a pay condition by ID and updates the internal pay conditions signal.
 * @param id - ID of the pay condition to delete
 * @returns Observable that completes when the deletion is done
 */
  deletePayCondition(id: number): Observable<void> {
    return this.checkPayConditionUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.payConditionService.deletePayCondition(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a pay condition is used by any customer contacts or employees.
   * @param idPayCondition - ID of the pay condition to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkPayConditionUsage(idPayCondition: number): Observable<boolean> {
    return this.invoiceUtils.getAllInvoices().pipe(
    map(invoices => invoices.some(invoice => invoice.payCondition?.id === idPayCondition)),
    catchError(err => {
      console.error('Error checking pay condition usage:', err);
      return of(false);
    })
  );
  }

  /**
 * Updates a pay condition by ID and updates the internal payConditions signal.
 * @param id - ID of the pay condition to update
 * @returns Observable that completes when the update is done
 */
  updatePayCondition(payCondition: PayCondition): Observable<PayCondition> {
    if (!payCondition?.id) {
      return throwError(() => new Error('Invalid pay condition data'));
    }

    return this.payConditionService.getPayConditionById(payCondition.id).pipe(
      take(1),
      map((currentPayCondition) => {
        if (!currentPayCondition) {
          throw new Error('pay condition not found');
        }
        if (currentPayCondition.version !== payCondition.version) {
          throw new Error('Version conflict: pay condition has been updated by another user');
        }
        return payCondition;
      }),
      switchMap((validatedPayCondition: PayCondition) => this.payConditionService.updatePayCondition(validatedPayCondition)),
      catchError((err) => {
        console.error('Error updating pay condition:', err);
        return throwError(() => err);
      })
    );
  }
}