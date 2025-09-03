import { EmploymentContract } from "./employment-contract";
import { BasicContract } from "./basicContract"; 

export interface ContractOrderCommission {
  id: number;
  createdAt: string;
  updatedAt: string;
  version: number;

  basicContract: BasicContract | null; 
  employmentContact: EmploymentContract | null; 

  fromOrderValue: number;
  commission: number;
  minCommission: number;
}