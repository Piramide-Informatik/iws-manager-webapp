import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class WorkContractsService {
  constructor() {}
  list() {
    return Promise.resolve([
      {
        employeeId: 1,
        firstName: 'John',
        lastName: 'Doe',
        date: '2025-03-25',
        salary: 50000,
        weeklyHours: 40,
        abbreviation: 'JD',
        maxHrsMonth: 160,
        maxHrsDay: 8,
        hourlyRate: 31.25,
        noteLine: 'Regular contract',
      },
      {
        employeeId: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        date: '2025-03-26',
        salary: 55000,
        weeklyHours: 45,
        abbreviation: 'JS',
        maxHrsMonth: 180,
        maxHrsDay: 9,
        hourlyRate: 33.33,
        noteLine: 'Full-time contract',
      },
    ]);
  }
}
