import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { InvoiceType } from '../../../../../Entities/invoiceType';

@Injectable({ providedIn: 'root' })
export class InvoiceTypeStateService {
  private readonly editInvoiceTypeSource = new BehaviorSubject<InvoiceType | null>(null);
  currentInvoiceType$ = this.editInvoiceTypeSource.asObservable();

  setInvoiceTypeToEdit(invoiceType: InvoiceType | null): void {
    this.editInvoiceTypeSource.next(invoiceType);
  }

  clearInvoiceType() {
    this.editInvoiceTypeSource.next(null);
  }
}