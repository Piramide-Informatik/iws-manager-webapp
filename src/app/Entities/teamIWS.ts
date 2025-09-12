import { EmployeeIws } from "./employeeIws";
export interface TeamIws {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  teamleader?: number; // consult

  teamiws?: string;
  name?: string
  teamLeader?: EmployeeIws | null;
}