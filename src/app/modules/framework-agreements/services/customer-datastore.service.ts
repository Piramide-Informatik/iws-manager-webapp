import { Injectable } from '@angular/core';
import { FrameworkAgreements } from '../../../Entities/Framework-agreements';

@Injectable({
  providedIn: 'root'
})
export class CustomerDatastoreService {
  constructor() { }

  list(): FrameworkAgreements[] {
    return [
      { id: 1, frameworkContract: 'Contract A', date: '2025-01-15', fundingProgram: 'Program Alpha', contractStatus: 'Active', iwsEmployee: 'John Doe' },
      { id: 2, frameworkContract: 'Contract B', date: '2025-02-20', fundingProgram: 'Program Beta', contractStatus: 'Pending', iwsEmployee: 'Jane Smith' },
      { id: 3, frameworkContract: 'Contract C', date: '2025-03-10', fundingProgram: 'Program Gamma', contractStatus: 'Completed', iwsEmployee: 'Alice Brown' },
      { id: 4, frameworkContract: 'Contract D', date: '2025-04-05', fundingProgram: 'Program Delta', contractStatus: 'Active', iwsEmployee: 'Bob White' },
      { id: 5, frameworkContract: 'Contract E', date: '2025-05-12', fundingProgram: 'Program Epsilon', contractStatus: 'Cancelled', iwsEmployee: 'Charlie Black' },
      { id: 6, frameworkContract: 'Contract F', date: '2025-06-18', fundingProgram: 'Program Zeta', contractStatus: 'Active', iwsEmployee: 'Diana Green' },
      { id: 7, frameworkContract: 'Contract G', date: '2025-07-22', fundingProgram: 'Program Eta', contractStatus: 'Pending', iwsEmployee: 'Edward Gray' },
      { id: 8, frameworkContract: 'Contract H', date: '2025-08-30', fundingProgram: 'Program Theta', contractStatus: 'Completed', iwsEmployee: 'Frank Blue' },
      { id: 9, frameworkContract: 'Contract I', date: '2025-09-14', fundingProgram: 'Program Iota', contractStatus: 'Active', iwsEmployee: 'Gina Yellow' },
      { id: 10, frameworkContract: 'Contract J', date: '2025-10-01', fundingProgram: 'Program Kappa', contractStatus: 'Cancelled', iwsEmployee: 'Henry Orange' }
    ];
  }
}