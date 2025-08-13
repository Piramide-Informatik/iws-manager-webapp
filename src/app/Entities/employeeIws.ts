import { TeamIws } from "./teamIWS";

export interface EmployeeIws {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  teamiws: TeamIws | null;
  user: null; //falta

  active?: number; //smallint
  employeelabel?: string;
  employeeno?: number;
  enddate?: string; //date
  firstname?: string;
  lastname?: string;
  mail?: string;
  startdate?: string; //date
}