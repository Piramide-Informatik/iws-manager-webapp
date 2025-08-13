import { ContractStatus } from "./contractStatus";
import { Customer } from "./customer";
import { EmployeeIws } from "./employeeIws";
import { FundingProgram } from "./fundingProgram";

export interface BasicContract {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  contractstatus: ContractStatus | null;
  customer: Customer | null;
  fundingprogram: FundingProgram | null;
  iwsemployee: EmployeeIws | null;

  confirmationdate?: string; // date
  contractlabel?: string;
  contractno?: number;
  contracttitle?: string;
  date?: string;
}