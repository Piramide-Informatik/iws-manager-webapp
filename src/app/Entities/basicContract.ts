import { ContractStatus } from "./contractStatus";
import { Customer } from "./customer";
import { EmployeeIws } from "./employeeIws";
import { FundingProgram } from "./fundingProgram";

export interface BasicContract {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  contractStatus: ContractStatus | null;
  customer: Customer | null;
  fundingProgram: FundingProgram | null;
  employeeIws: EmployeeIws | null;

  confirmationDate?: string; // date
  contractLabel?: string;
  contractNo?: number;
  contractTitle?: string;
  date?: string;
}