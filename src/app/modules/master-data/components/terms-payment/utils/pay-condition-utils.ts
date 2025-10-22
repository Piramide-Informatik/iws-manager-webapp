import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap } from 'rxjs';
import { InvoiceUtils } from '../../../../invoices/utils/invoice.utils';
import { PayCondition } from '../../../../../Entities/payCondition';
import { PayConditionService } from '../../../../../Services/pay-condition.service';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

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

  addPayCondition(payCondition: Omit<PayCondition, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<PayCondition> {
    return this.payConditionService.addPayCondition(payCondition);
  }

  getAllPayConditions(): Observable<PayCondition[]> {
    return this.payConditionService.getAllPayConditions();
  }

  refreshPayConditions(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.payConditionService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Deletes a pay condition by ID.
   * @param id - ID of the pay condition to delete
   * @returns Observable that completes when deletion is done
   */
  deletePayCondition(id: number): Observable<void> {
    return this.payConditionService.deletePayCondition(id);
  }

  updatePayCondition(payCondition: PayCondition): Observable<PayCondition> {
    if (!payCondition?.id) {
      return throwError(() => new Error('Invalid pay condition data'));
    }

    return this.payConditionService.getPayConditionById(payCondition.id).pipe(
      take(1),
      switchMap((currentPayCondition) => {
        if (!currentPayCondition) {
          return throwError(() => createNotFoundUpdateError('TermsPayment'));
        }
        if (currentPayCondition.version !== payCondition.version) {
          return throwError(() => createUpdateConflictError('TermsPayment'));
        }
        return this.payConditionService.updatePayCondition(payCondition);
      }),
      catchError((err) => {
        console.error('Error updating pay condition:', err);
        return throwError(() => err);
      })
    );
  }
}
