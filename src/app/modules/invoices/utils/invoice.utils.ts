import { inject, Injectable } from '@angular/core';
import { InvoiceService } from '../../../Services/invoice.service';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';
import { Invoice } from '../../../Entities/invoices';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for invoice-related business logic and operations.
 * Works with InvoiceService's reactive signals while providing additional functionality.
 */
export class InvoiceUtils {
  private readonly invoiceService = inject(InvoiceService);
  
  /**
  * Gets a invoice by ID with proper error handling
  * @param id - ID of the invoice to retrieve
  * @returns Observable emitting the invoice or undefined if not found
  */
  getInvoiceById(id: number): Observable<Invoice | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid invoice ID'));
    }

    return this.invoiceService.getInvoiceById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load invoice'));
      })
    );
  }

  /**
  * Gets all invoices given a customer
  * @param customerId - Customer to get his invoices
  * @returns Observable emitting the raw list of invoices
  */
  getAllInvoicesByCustomerId(customerId: number): Observable<Invoice[]> {
    return this.invoiceService.getAllInvoicesByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load invoices')))
    );
  }

  /**
  * Gets all invoices given a order
  * @param orderId - Order to get his invoices
  * @returns Observable emitting the raw list of invoices
  */
  getAllInvoicesByOrderId(orderId: number): Observable<Invoice[]> {
    return this.invoiceService.getAllInvoicesByOrderId(orderId).pipe(
      catchError(() => throwError(() => new Error('Failed to load invoices by order')))
    );
  }

  /**
  * Gets all invoices
  * @returns Observable emitting the raw list of invoices
  */
  getAllInvoices(): Observable<Invoice[]> {
    return this.invoiceService.getAllInvoices().pipe(
      catchError(() => throwError(() => new Error('Failed to load invoices')))
    );
  }

  /**
  * Creates a new invoice with validation
  * @param invoice - Invoice object to create (without id)
  * @returns Observable that completes when invoice is created
  */
  createNewInvoice(invoice: Omit<Invoice, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Invoice> {
    return this.invoiceService.addInvoice(invoice);
  }

  /**
  * Delete an Invoice by ID and updates the internal invoices signal.
  * @param id - ID of the invoice to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteInvoice(id: number): Observable<void> {
    return this.invoiceService.deleteInvoice(id);
  }

  /**
  * Updates a invoice by ID and updates the internal invoices signal.
  * @param invoice - Invoice object with updated data
  * @returns Observable that completes when the update is done
  */
  updateInvoice(invoice: Invoice): Observable<Invoice> {
    if (!invoice.id) {
      return throwError(() => new Error('Invalid invoice data'));
    }

    return this.invoiceService.getInvoiceById(invoice.id).pipe(
      take(1),
      switchMap((currentInvoice) => {
        if (!currentInvoice) {
          return throwError(() => new Error('Invoice not found'));
        }

        if (currentInvoice.version !== invoice.version) {
          return throwError(() => new Error('Conflict detected: invoice person version mismatch'));
        }

        return this.invoiceService.updateInvoice(invoice);
      })
    );
  }
}