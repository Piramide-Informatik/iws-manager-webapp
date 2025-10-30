import { Customer } from "./customer";
import { Employee } from "./employee";

export interface EmploymentContract {
    id: number;
    version: number;
    createdAt: string; // ISO format: "2025-06-17T06:21:35.281056"
    updatedAt: string;

    customer?: Customer | null;
    employee?: Employee | null;

    hourlyRate?: number;
    hourlyRealRate?: number;
    hoursPerWeek?: number;
    maxHoursPerDay?: number;
    maxHoursPerMonth?: number;
    salaryPerMonth?: number;
    specialPayment?: number;
    startDate: string; // ISO format: "2025-06-17"
    workShortTime?: number;
}