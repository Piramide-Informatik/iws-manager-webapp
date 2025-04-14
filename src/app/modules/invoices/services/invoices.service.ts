import { Injectable } from '@angular/core';
import { Invoice } from '../../../Entities/invoices';
import { InvoicesDatastoreService } from './invoices-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class InvoicesService {
  constructor(private readonly datastore: InvoicesDatastoreService) {}

  private invoices: Invoice[] = [];

  list() {
    return this.datastore.list();
  }

  addProduct(invoice: Invoice): Promise<Invoice[]> {
    this.invoices.push(invoice);
    return Promise.resolve(this.invoices);
  }

  updateProduct(updatedInvoice: Invoice): Promise<Invoice[]> {
    const index = this.invoices.findIndex(
      (invoice) => invoice.invoiceNumber === updatedInvoice.invoiceNumber
    );
    if (index !== -1) {
      this.invoices[index] = updatedInvoice;
    }
    return Promise.resolve(this.invoices);
  }
  deleteInvoice(invoiceNumber: string): void {
    this.invoices = this.invoices.filter(
      (invoice) => invoice.invoiceNumber !== invoiceNumber
    );
  }
}
