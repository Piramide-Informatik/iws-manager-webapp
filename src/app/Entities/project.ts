import { Customer } from "./customer";
import { EmployeeIws } from "./employeeIws";
import { FundingProgram } from "./fundingProgram";
import { Network } from "./network";
import { Order } from "./order";
import { ProjectStatus } from "./projectStatus";
import { Promoter } from "./promoter";

export interface Project {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  customer: Customer | null;
  empiws20: EmployeeIws | null;
  empiws30: EmployeeIws | null;
  empiws50: EmployeeIws | null;
  fundingProgram: FundingProgram | null;
  network: Network | null;
  promoter: Promoter | null;
  status: ProjectStatus | null;
  orderIdFue?: Order | null;
  orderIdAdmin?: Order | null;

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
