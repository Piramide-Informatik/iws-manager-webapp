import { Country } from "./country";
import { Customer } from "./customer";

export interface Project {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  customer: Customer | null;
  
  approvalDate?: String;
  authorizationDate?: String;
  chance?: Number;
  comment?: String;
  date1?: String;
  date2?: String;
  date3?: String;
  date4?: String;
  date5?: String;
  endApproval?: String;
  endDate?: String;
  financeAuthority?: String;
  fundingLabel?: String;
  fundingRate?: Number;
  hourlyRateMueu?: Number;
  income1?: Number;
  income2?: Number;
  income3?: Number;
  income4?: Number;
  income5?: Number;
  maxHoursPerMonth?: Number;
  maxHoursPerYear?: Number;
  orderIdFue?: Number;
  orderIdAdmin?: Number;
  stuffFlat?: Number;
  productiveHoursPerYear?: Number;
  projectLabel?: String;
  projectName?: string;
  note?: String;
  shareResearch?: Number;
  startApproval?: String;
  startDate?: String;
  title?: String;
  fundingProgram: FundingProgram | null;
  promoter: Promoter | null;  
}

export interface FundingProgram {
  defaultFundingRate: number;
  defaultHoursPerYear: number;
  defaultResearchShare: number;
  defaultStuffFlat: number;
  name: string;
}

export interface Promoter {
  city: string;
  country: Country;
  projectPromoter: string;
  promoterName1: string;
  promoterName2: string;
  promoterNo: string;
  street: string;
  zipCode: string;
}
  
