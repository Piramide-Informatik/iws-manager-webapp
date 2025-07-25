import { Subcontract } from "./subcontract";

export interface SubcontractYear {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  year?: number;
  months?: string;
  subcontract: Subcontract | undefined;
  //value: number;  double (subcontract.invoicenet /subcontract.afamonths *subcontractyear.months)
}