import { Injectable } from '@angular/core';
import { Subcontract } from '../../../../Entities/subcontract';

@Injectable({
  providedIn: 'root',
})
export class SubcontractDatastoreService {
  constructor() {}

  list(): Subcontract[] {
    return [
      {
        orderId: 1,
        contractor: 'Digital Creations LLC',
        invoiceNumber: 'INV-2025-0001',
        invoiceDate: '2025-02-01',
        isNet: true,
        amount: 7500.0,
        afa: true,
        afaDuration: 24,
        description: 'Development of frontend and backend for client system.',
      },
      {
        orderId: 2,
        contractor: 'Workspace Solutions Inc.',
        invoiceNumber: 'INV-2025-0002',
        invoiceDate: '2025-03-10',
        isNet: false,
        amount: 18500.0,
        afa: false,
        description: 'Office furniture delivery and setup.',
      },
      {
        orderId: 3,
        contractor: 'BrandBoost Agency',
        invoiceNumber: 'INV-2025-0003',
        invoiceDate: '2025-04-18',
        isNet: true,
        amount: 32000.0,
        afa: true,
        afaDuration: 36,
        description: 'Marketing campaign for product launch.',
      },
    ];
  }
}
