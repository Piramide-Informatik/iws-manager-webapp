import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, of } from 'rxjs';
import { InvoiceUtils } from '../../../../invoices/utils/invoice.utils';
import { InvoiceType } from '../../../../../Entities/invoiceType';
import { InvoiceTypeService } from '../../../../../Services/invoice-type.service';

/**
 * Utility class for invoiceType-related business logic and operations.
 * Works with InvoiceTypeService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class InvoiceTypeUtils {
  private readonly invoiceTypeService = inject(InvoiceTypeService);
  private readonly invoiceUtils = inject(InvoiceUtils);

  loadInitialData(): Observable<InvoiceType[]> {
    return this.invoiceTypeService.loadInitialData();
  }

  /**
   * Gets a invoice type by ID with proper error handling
   * @param id - ID of the invoiceType to retrieve
   * @returns Observable emitting the invoiceType or undefined if not found
   */
  getInvoiceTypeById(id: number): Observable<InvoiceType | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid invoice type ID'));
    }

    return this.invoiceTypeService.getInvoiceTypeById(id).pipe(
      catchError(err => {
        console.error('Error fetching invoice type:', err);
        return throwError(() => new Error('Failed to load invoice type'));
      })
    );
  }

  /**
   * Creates a new invoice type with validation
   * @param invoiceType - New invoice type
   * @returns Observable that completes when invoice type is created
   */
  addInvoiceType(invoiceType: Omit<InvoiceType, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<InvoiceType> {
    return this.invoiceTypeService.addInvoiceType(invoiceType);
  }

  /**
   * Gets all invoice types
   * @returns Observable emitting sorted array of invoice types
   */
  getAllInvoiceTypes(): Observable<InvoiceType[]> {
    return this.invoiceTypeService.getAllInvoiceTypes();
  }

  /**
   * Refreshes invoice types data
   * @returns Observable that completes when refresh is done
  */
  refreshInvoiceTypes(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.invoiceTypeService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a invoice type by ID and updates the internal invoice types signal.
 * @param id - ID of the invoice type to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteInvoiceType(id: number): Observable<void> {
    return this.checkInvoiceTypeUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.invoiceTypeService.deleteInvoiceType(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a invoice type is used by any invoice.
   * @param idInvoiceType - ID of the invoice type to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkInvoiceTypeUsage(idInvoiceType: number): Observable<boolean> {
    return this.invoiceUtils.getAllInvoices().pipe(
      map(invoices => invoices.some(invoice => invoice.invoiceType?.id === idInvoiceType)),
      catchError(err => {
        console.error('Error checking invoice type usage:', err);
        return of(false);
      })
    );
  }

  /**
 * Updates a invoice type by ID and updates the internal invoice types signal.
 * @param id - ID of the invoice type to update
 * @returns Observable that completes when the update is done
 */
  updateInvoiceType(invoiceType: InvoiceType): Observable<InvoiceType> {
    if (!invoiceType?.id) {
      return throwError(() => new Error('Invalid invoice type data'));
    }

    return this.invoiceTypeService.getInvoiceTypeById(invoiceType.id).pipe(
      take(1),
      map((currentInvoiceType) => {
        if (!currentInvoiceType) {
          throw new Error('Invoice Type not found');
        }
        if (currentInvoiceType.version !== invoiceType.version) {
          throw new Error('Version conflict: Invoice Type has been updated by another user');
        }
        return invoiceType;
      }),
      switchMap((validatedInvoiceType: InvoiceType) => this.invoiceTypeService.updateInvoiceType(validatedInvoiceType)),
      catchError((err) => {
        console.error('Error updating invoice type:', err);
        return throwError(() => err);
      })
    );
  }
}