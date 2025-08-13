import { Customer } from "./customer";
import { FundingProgram } from "./fundingProgram";
import { Promoter } from "./promoter";

export interface Project {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  customer: Customer | null;
  empiws20: null; // falta
  empiws30: null; // falta
  empiws50: null; // falta
  fundingProgram: FundingProgram | null;
  network: null; //falta
  promoter: Promoter | null;
  status: null; //falta
  
  approvalDate?: string;
  authorizationDate?: string;
  chance?: number;
  comment?: string;
  date1?: string;
  date2?: string;
  date3?: string;
  date4?: string;
  date5?: string;
  datelevel1?: string;
  datelevel2?: string;
  donation?: string;
  endApproval?: string;
  endDate?: string;
  financeAuthority?: string;
  fundingLabel?: string;
  fundingRate?: number;
  hourlyRateMueu?: number;
  income1?: number;
  income2?: number;
  income3?: number;
  income4?: number;
  income5?: number;
  maxHoursPerMonth?: number;
  maxHoursPerYear?: number;
  orderIdFue?: number;
  orderIdAdmin?: number;
  stuffFlat?: number;
  productiveHoursPerYear?: number;
  projectLabel?: string;
  projectName?: string;
  note?: string;
  shareResearch?: number;
  startApproval?: string;
  startDate?: string;
  title?: string; 
}
