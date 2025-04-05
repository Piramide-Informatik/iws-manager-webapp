import { Injectable } from '@angular/core';
import { WorkContract } from '../../../Entities/work-contracts';

@Injectable({
  providedIn: 'root',
})
export class WorkContractsService {
  constructor() {}
  private products = [
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
    {
      employeeId: 3,
      firstName: 'Michael',
      lastName: 'Johnson',
      date: '2025-03-27',
      salary: 60000,
      weeklyHours: 40,
      abbreviation: 'MJ',
      maxHrsMonth: 160,
      maxHrsDay: 8,
      hourlyRate: 37.5,
      noteLine: 'Regular contract',
    },
    {
      employeeId: 4,
      firstName: 'Emily',
      lastName: 'Williams',
      date: '2025-03-28',
      salary: 58000,
      weeklyHours: 42,
      abbreviation: 'EW',
      maxHrsMonth: 168,
      maxHrsDay: 8,
      hourlyRate: 34.52,
      noteLine: 'Part-time contract',
    },
    {
      employeeId: 5,
      firstName: 'David',
      lastName: 'Brown',
      date: '2025-03-29',
      salary: 62000,
      weeklyHours: 38,
      abbreviation: 'DB',
      maxHrsMonth: 152,
      maxHrsDay: 8,
      hourlyRate: 39.47,
      noteLine: 'Full-time contract',
    },
    {
      employeeId: 6,
      firstName: 'Sophia',
      lastName: 'Jones',
      date: '2025-03-30',
      salary: 53000,
      weeklyHours: 40,
      abbreviation: 'SJ',
      maxHrsMonth: 160,
      maxHrsDay: 8,
      hourlyRate: 33.13,
      noteLine: 'Regular contract',
    },
    {
      employeeId: 7,
      firstName: 'James',
      lastName: 'Garcia',
      date: '2025-03-31',
      salary: 57000,
      weeklyHours: 44,
      abbreviation: 'JG',
      maxHrsMonth: 176,
      maxHrsDay: 8,
      hourlyRate: 36.64,
      noteLine: 'Contract',
    },
    {
      employeeId: 8,
      firstName: 'Olivia',
      lastName: 'Martinez',
      date: '2025-04-01',
      salary: 59000,
      weeklyHours: 41,
      abbreviation: 'OM',
      maxHrsMonth: 164,
      maxHrsDay: 8,
      hourlyRate: 35.85,
      noteLine: 'Full-time contract',
    },
    {
      employeeId: 9,
      firstName: 'William',
      lastName: 'Hernandez',
      date: '2025-04-02',
      salary: 65000,
      weeklyHours: 40,
      abbreviation: 'WH',
      maxHrsMonth: 160,
      maxHrsDay: 8,
      hourlyRate: 40.63,
      noteLine: 'Full-time contract',
    },
    {
      employeeId: 10,
      firstName: 'Liam',
      lastName: 'Lopez',
      date: '2025-04-03',
      salary: 64000,
      weeklyHours: 43,
      abbreviation: 'LL',
      maxHrsMonth: 172,
      maxHrsDay: 8,
      hourlyRate: 37.21,
      noteLine: 'Regular contract',
    },
  ];

  list() {
    return Promise.resolve(this.products);
  }

  addProduct(product: WorkContract) {
    console.log('Adding product:', product);
    this.products.push(product);
    console.log('Updated products list:', this.products);
    return Promise.resolve(this.products);
  }

  updateProduct(updatedProduct: WorkContract) {
    const index = this.products.findIndex(
      (product) => product.employeeId === updatedProduct.employeeId
    );
    if (index !== -1) {
      this.products[index] = updatedProduct;
    }
    console.log('Updated products list:', this.products);
    return Promise.resolve(this.products);
  }
}
