import { ApprovalStatus } from "./approvalStatus";
import { Contractor } from "./contractor";
import { ContractStatus } from "./contractStatus";
import { Customer } from "./customer";
import { Project } from "./project";
import { Promoter } from "./promoter";

export interface Order {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  approvalstatus: ApprovalStatus | null;
  basiccontract: null; //falta
  contractor: Contractor | null;
  contractstatus: ContractStatus | null;
  customer: Customer | null;
  employeeiws: null;  //falta
  fundingprogram: null; //falta
  ordertype: null; //falta
  project: Project | null;
  promoter: Promoter | null;

  acronym?: string;
  approvaldate?: string; //date
  approvalpdf?: string; // Base64-encoded PDF
  contractdata1?: string;
  contractdata2?: string;
  contractpdf?: string;  // Base64-encoded PDF
  fixcommission?: number; 
  iwsprovision?: number;
  maxcommission?: number;
  nextdeptdate?: string;  //date
  noofdepts?: number;  //smallint
  orderdate?: string; //date
  orderlabel?: string; 
  orderno?: number;
  ordertitle?: string;
  ordervalue?: number;
  signaturedate?: string; //date
}