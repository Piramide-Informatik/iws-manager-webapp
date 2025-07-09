import { Customer } from './customer';
import { Employee } from './employee';

export interface EmploymentContract {
  id: number;
  version?: number;
  createdAt?: string;   
  updatedAt?: string;
  
  hourlyRate: number;
  hourlyRealRate: number;
  hoursPerWeek: number;
  maxHoursPerDay: number;
  maxHoursPerMonth: number;
  salaryPerMonth: number;
  specialPayment: number;
  startDate: string;   
  workShortTime: number;
  
  customer: Customer | null;
  employee: Employee | null;
}



