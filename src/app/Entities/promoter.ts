import { Country } from "./country";

export interface Promoter {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  country: Country | null;

  city?: string;
  projectPromoter? : string;
  promoterName1?: string;
  promoterName2?: string;
  promoterNo?: string | null;
  street?: string;
  zipCode?: string;
}