import { Injectable } from '@angular/core';
import { WorkContract } from '../../../../Entities/work-contracts';
import { WorkContractsDataService } from './work-contracts-datastore.service';

@Injectable({
  providedIn: 'root',
})
export class WorkContractsService {
  constructor(private readonly datastore: WorkContractsDataService) {}
  private workContracts = [
    {
      employeeId: 1,
      firstName: 'John',
      lastName: 'Doe',
      startDate: '03.04.2020',
      salaryPerMonth: 5040,
      weeklyHours: 40,
      worksShortTime: 3,
      specialPayment: 160,
      maxHrspPerMonth: 240,
      maxHrsPerDay: 8,
      hourlyRate: 348
    },
    {
      employeeId: 2,
      firstName: 'Jane',
      lastName: 'Smith',
      startDate: '10.02.2021',
      salaryPerMonth: 4800,
      weeklyHours: 42,
      worksShortTime: 2.5,
      specialPayment: 120,
      maxHrspPerMonth: 245,
      maxHrsPerDay: 9,
      hourlyRate: 234
    },
    {
      employeeId: 3,
      firstName: 'Michael',
      lastName: 'Johnson',
      startDate: '15.09.2021',
      salaryPerMonth: 3850,
      weeklyHours: 41,
      worksShortTime: 3.1,
      specialPayment: 80,
      maxHrspPerMonth: 242,
      maxHrsPerDay: 8,
      hourlyRate: 169
    },
    {
      employeeId: 4,
      firstName: 'Emily',
      lastName: 'Williams',
      startDate: '11.11.2022',
      salaryPerMonth: 4380,
      weeklyHours: 42,
      worksShortTime: 2.5,
      specialPayment: 130,
      maxHrspPerMonth: 244,
      maxHrsPerDay: 9,
      hourlyRate: 215
    }
  ];

  list() {
    return this.datastore.list();

  }

  addProduct(workContract: WorkContract) {
    this.workContracts.push(workContract);
    return Promise.resolve(this.workContracts);
  }

  deleteWorkContract(employeeId: number): void {
    this.workContracts = this.workContracts.filter(
      (workContract) => workContract.employeeId !== employeeId
    );
  }

  updateProduct(updatedWorkContract: WorkContract) {
    const index = this.workContracts.findIndex(
      (workContract) => workContract.employeeId === updatedWorkContract.employeeId
    );
    if (index !== -1) {
      this.workContracts[index] = updatedWorkContract;
    }
    return Promise.resolve(this.workContracts);
  }
}
