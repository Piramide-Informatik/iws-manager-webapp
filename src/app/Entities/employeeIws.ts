import { TeamIws } from "./teamIWS";
import { User } from "./user";

export interface EmployeeIws {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  teamIws: TeamIws | null;
  user: User | null;

  active?: number; //smallint
  employeeLabel?: string;
  employeeNo?: number;
  endDate?: string; //date
  firstname?: string;
  lastname?: string;
  mail?: string;
  startDate?: string; //date
}