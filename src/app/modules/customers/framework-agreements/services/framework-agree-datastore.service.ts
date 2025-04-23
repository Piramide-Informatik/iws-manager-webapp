import { Injectable } from '@angular/core';
import { FrameworkAgreements } from '../../../../Entities/Framework-agreements';

@Injectable({
  providedIn: 'root'
})
export class FrameworkDatastoreService {
  constructor() { }

  list(): FrameworkAgreements[] {
    return [
      { id: 61724, frameworkContract: 'Contract A', date: '15.01.2023', fundingProgram: 'Program Alpha', contractStatus: 'Active', iwsEmployee: 'John Doe' },
      { id: 98324, frameworkContract: 'Contract B', date: '20.02.2023', fundingProgram: 'Program Beta', contractStatus: 'Pending', iwsEmployee: 'Jane Smith' },
      { id: 37393, frameworkContract: 'Contract C', date: '08.02.2024', fundingProgram: 'Program Gamma', contractStatus: 'Completed', iwsEmployee: 'Alice Brown' },
      { id: 47423, frameworkContract: 'Contract D', date: '20.05.2024', fundingProgram: 'Program Delta', contractStatus: 'Active', iwsEmployee: 'Bob White' },
      { id: 53621, frameworkContract: 'Contract E', date: '13.08.2024', fundingProgram: 'Program Epsilon', contractStatus: 'Cancelled', iwsEmployee: 'Charlie Black' },
      { id: 60934, frameworkContract: 'Contract F', date: '18.09.2024', fundingProgram: 'Program Zeta', contractStatus: 'Active', iwsEmployee: 'Diana Green' },
      { id: 76129, frameworkContract: 'Contract G', date: '25.09.2024', fundingProgram: 'Program Eta', contractStatus: 'Pending', iwsEmployee: 'Edward Gray' },
      { id: 82196, frameworkContract: 'Contract H', date: '01.10.2024', fundingProgram: 'Program Theta', contractStatus: 'Completed', iwsEmployee: 'Frank Blue' },
      { id: 90124, frameworkContract: 'Contract I', date: '11.11.2024', fundingProgram: 'Program Iota', contractStatus: 'Active', iwsEmployee: 'Gina Yellow' },
      { id: 39174, frameworkContract: 'Contract J', date: '05.02.2025', fundingProgram: 'Program Kappa', contractStatus: 'Cancelled', iwsEmployee: 'Henry Orange' }
    ];
  }
}