import { Vat } from "./vat";

export interface VatRate {
  id: number;
  createdAt?: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt?: string;
  version?: number;

  vat: Vat | null;

  fromDate?: string;
  rate?: number;  //decimal(5,2)
}