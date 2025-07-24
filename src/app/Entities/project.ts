import { Customer } from "./customer";

export interface Project {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;
  projectLabel: string;
  projectName: string;
  fundingProgram: string;
  promoter: string;
  fundingLabel: string;
  startDate: string;
  endDate: string;
  authDate: string;
  fundingRate: string;
  customer: Customer
}
  