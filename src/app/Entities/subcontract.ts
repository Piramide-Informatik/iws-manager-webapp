import { Contractor } from "./contractor";
import { Customer } from "./customer";
import { ProjectCostCenter } from "./projectCostCenter";

export interface Subcontract {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  contractor: Contractor | null;
  customer: Customer | null;
  projectCostCenter: ProjectCostCenter | null;

  afamonths: number;
  contractTitle: string;
  date: string;
  description: string;
  invoiceAmount: number;
  invoiceDate?: string; 
  invoiceGross: number;
  invoiceNet: number;
  invoiceNo: string;
  isAfa: boolean; 
  netOrGross: boolean;
  note: string;
}
