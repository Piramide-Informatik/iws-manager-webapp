import { Injectable } from '@angular/core';
import { Customer } from '../../../Entities/customer';

@Injectable({
  providedIn: 'root'
})
export class CustomerDatastoreService {
  constructor() { }

  list(): Customer[] {
    return [
      { id: 1, companyName: 'ABC Ltd.', nameLine2: 'John Doe', kind: 'Premium', land: 'USA', place: 'New York', contact: 'john@example.com' },
      { id: 2, companyName: 'XYZ Corp.', nameLine2: 'Jane Smith', kind: 'Standard', land: 'UK', place: 'London', contact: 'jane@example.com' },
      { id: 3, companyName: 'Acme Inc.', nameLine2: 'Alice Brown', kind: 'Premium', land: 'Canada', place: 'Toronto', contact: 'alice@example.com' },
      { id: 4, companyName: 'Tech Solutions', nameLine2: 'Bob White', kind: 'Standard', land: 'Germany', place: 'Berlin', contact: 'bob@example.com' },
      { id: 5, companyName: 'Globex Corp.', nameLine2: 'Charlie Black', kind: 'Premium', land: 'France', place: 'Paris', contact: 'charlie@example.com' },
      { id: 6, companyName: 'Initech', nameLine2: 'Diana Green', kind: 'Standard', land: 'Spain', place: 'Madrid', contact: 'diana@example.com' },
      { id: 7, companyName: 'Umbrella Corp.', nameLine2: 'Edward Gray', kind: 'Premium', land: 'Italy', place: 'Rome', contact: 'edward@example.com' },
      { id: 8, companyName: 'Soylent Corp.', nameLine2: 'Frank Blue', kind: 'Standard', land: 'Netherlands', place: 'Amsterdam', contact: 'frank@example.com' },
      { id: 9, companyName: 'Stark Industries', nameLine2: 'Gina Yellow', kind: 'Premium', land: 'India', place: 'Mumbai', contact: 'gina@example.com' },
      { id: 10, companyName: 'Wayne Enterprises', nameLine2: 'Henry Orange', kind: 'Standard', land: 'Brazil', place: 'São Paulo', contact: 'henry@example.com' },
      { id: 11, companyName: 'LexCorp', nameLine2: 'Isabel Purple', kind: 'Premium', land: 'Mexico', place: 'Mexico City', contact: 'isabel@example.com' },
      { id: 12, companyName: 'Oscorp', nameLine2: 'Jack Red', kind: 'Standard', land: 'Argentina', place: 'Buenos Aires', contact: 'jack@example.com' },
      { id: 13, companyName: 'Cyberdyne Systems', nameLine2: 'Kelly Pink', kind: 'Premium', land: 'South Korea', place: 'Seoul', contact: 'kelly@example.com' },
      { id: 14, companyName: 'Aperture Science', nameLine2: 'Liam Cyan', kind: 'Standard', land: 'Australia', place: 'Sydney', contact: 'liam@example.com' },
      { id: 15, companyName: 'Black Mesa', nameLine2: 'Mia Lime', kind: 'Premium', land: 'Russia', place: 'Moscow', contact: 'mia@example.com' }
    ];
  }
}
