import { inject, Injectable } from '@angular/core';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';
import { ReceivableService } from '../../../Services/receivable.service';
import { Debt } from '../../../Entities/debt';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for receivables-related business logic and operations.
 * Works with Receivable Service's reactive signals while providing additional functionality.
 */
export class ReceivableUtils {
  private readonly receivableService = inject(ReceivableService);
 
  /**
  * Gets a receivable by ID with proper error handling
  * @param id - ID of the receivable to retrieve
  * @returns Observable emitting the receivable or undefined if not found
  */
  getReceivableById(id: number): Observable<Debt | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid receivable ID'));
    }

    return this.receivableService.getReceivableById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load receivable'));
      })
    );
  }

  /**
  * Gets all receivables given a customer
  * @param customerId - Customer to get his receivables
  * @returns Observable emitting the raw list of receivables
  */
  getAllReceivableByCustomerId(customerId: number): Observable<Debt[]> {
    return this.receivableService.getAllReceivablesByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load receivables')))
    );
  }

  /**
  * Gets all receivables given a order
  * @param orderId - ORder to get his receivables
  * @returns Observable emitting the raw list of receivables
  */
  getAllReceivableByOrderId(orderId: number): Observable<Debt[]> {
    return this.receivableService.getAllReceivableByOrderId(orderId).pipe(
      catchError(() => throwError(() => new Error('Failed to load receivables')))
    );
  }

  /**
  * Creates a new receivable with validation
  * @param receivable - Receivable object to create (without id)
  * @returns Observable that completes when receivable is created
  */
  createReceivable(receivable: Omit<Debt, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Debt> {
    return this.receivableService.addReceivable(receivable);
  }

  /**
  * Deletes a receivable by ID and updates the internal receivables signal.
  * @param id - ID of the receivable to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteReceivable(id: number): Observable<void> {
    return this.receivableService.deleteReceivable(id).pipe(
      catchError(error => {
        console.log('Error delete receivable', error)
        return throwError(() => error);
      })
    );
  }

  /**
  * Updates a receivable by ID and updates the internal receivables signal.
  * @param receivable - Receivable object with updated data
  * @returns Observable that completes when the update is done
  */
  updateReceivable(receivable: Debt): Observable<Debt> {
    if (!receivable.id) {
      return throwError(() => new Error('Invalid receivable data'));
    }

    return this.receivableService.getReceivableById(receivable.id).pipe(
      take(1),
      switchMap((currentReceivable) => {
        if (!currentReceivable) {
          return throwError(() => new Error('Receivable not found'));
        }

        if (currentReceivable.version !== receivable.version) {
          return throwError(() => new Error('Conflict detected: receivable version mismatch'));
        }

        return this.receivableService.updateReceivable(receivable);
      })
    );
  }
}