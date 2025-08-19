import { ApprovalStatus } from "./approvalStatus";
import { BasicContract } from "./basicContract";
import { Contractor } from "./contractor";
import { ContractStatus } from "./contractStatus";
import { CostType } from "./costType";
import { Customer } from "./customer";
import { EmployeeIws } from "./employeeIws";
import { FundingProgram } from "./fundingProgram";
import { Project } from "./project";
import { Promoter } from "./promoter";

export interface Order {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  approvalstatus: ApprovalStatus | null;
  basiccontract: BasicContract | null;
  contractor: Contractor | null;
  contractStatus: ContractStatus | null;
  customer: Customer | null;
  employeeiws: EmployeeIws | null; 
  fundingProgram: FundingProgram | null;
  orderType: CostType | null; // reference costtype
  project: Project | null;
  promoter: Promoter | null;

  acronym?: string;
  approvaldate?: string; //date
  approvalpdf?: string; // Base64-encoded PDF
  contractdata1?: string;
  contractdata2?: string;
  contractpdf?: string;  // Base64-encoded PDF
  fixcommission?: number; 
  iwsProvision?: number;
  maxcommission?: number;
  nextdeptdate?: string;  //date
  noofdepts?: number;  //smallint
  orderDate?: string; //date
  orderLabel?: string; 
  orderno?: number;
  ordertitle?: string;
  orderValue?: number;
  signaturedate?: string; //date
}