import { Injectable } from '@angular/core';
import { Customer } from '../../../Entities/customer';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CustomerService {

  private readonly ROOT_URL = `${environment.BACK_END_HOST_DEV}`;

  constructor(private readonly http: HttpClient) { }

  // Get all countries
  getCustomers(): Customer[] {
    return [
      { id: 478923721, companyName: 'ABC Ltd.', nameLine2: 'John Doe', kind: 'Premium', land: 'USA', place: 'New York', contact: 'john@example.com' },
      { id: 732923721, companyName: 'XYZ Corp.', nameLine2: 'Jane Smith', kind: 'Standard', land: 'UK', place: 'London', contact: 'jane@example.com' },
      { id: 921923721, companyName: 'Acme Inc.', nameLine2: 'Alice Brown', kind: 'Premium', land: 'Canada', place: 'Toronto', contact: 'alice@example.com' },
      { id: 343923721, companyName: 'Tech Solutions', nameLine2: 'Bob White', kind: 'Standard', land: 'Germany', place: 'Berlin', contact: 'bob@example.com' },
      { id: 745923721, companyName: 'Globex Corp.', nameLine2: 'Charlie Black', kind: 'Premium', land: 'France', place: 'Paris', contact: 'charlie@example.com' },
      { id: 852923721, companyName: 'Initech', nameLine2: 'Diana Green', kind: 'Standard', land: 'Spain', place: 'Madrid', contact: 'diana@example.com' },
      { id: 402923721, companyName: 'Umbrella Corp.', nameLine2: 'Edward Gray', kind: 'Premium', land: 'Italy', place: 'Rome', contact: 'edward@example.com' },
      { id: 712923721, companyName: 'Soylent Corp.', nameLine2: 'Frank Blue', kind: 'Standard', land: 'Netherlands', place: 'Amsterdam', contact: 'frank@example.com' },
      { id: 832923721, companyName: 'Stark Industries', nameLine2: 'Gina Yellow', kind: 'Premium', land: 'India', place: 'Mumbai', contact: 'gina@example.com' },
      { id: 552923721, companyName: 'Wayne Enterprises', nameLine2: 'Henry Orange', kind: 'Standard', land: 'Brazil', place: 'São Paulo', contact: 'henry@example.com' },
      { id: 927923721, companyName: 'LexCorp', nameLine2: 'Isabel Purple', kind: 'Premium', land: 'Mexico', place: 'Mexico City', contact: 'isabel@example.com' },
      { id: 193923721, companyName: 'Oscorp', nameLine2: 'Jack Red', kind: 'Standard', land: 'Argentina', place: 'Buenos Aires', contact: 'jack@example.com' },
      { id: 492923721, companyName: 'Cyberdyne Systems', nameLine2: 'Kelly Pink', kind: 'Premium', land: 'South Korea', place: 'Seoul', contact: 'kelly@example.com' },
      { id: 288923721, companyName: 'Aperture Science', nameLine2: 'Liam Cyan', kind: 'Standard', land: 'Australia', place: 'Sydney', contact: 'liam@example.com' },
      { id: 483923721, companyName: 'Black Mesa', nameLine2: 'Mia Lime', kind: 'Premium', land: 'Russia', place: 'Moscow', contact: 'mia@example.com' }
    ];
  }

}