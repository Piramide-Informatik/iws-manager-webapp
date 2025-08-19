import { Country } from "./country";

export interface Promoter {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  country: Country | null;

  city?: string;
  promoter?: string;
  projectPromoter? : string;
  promotername1?: string;
  promotername2?: string;
  promoterno?: string;
  street?: string;
  zipcode?: string;
}