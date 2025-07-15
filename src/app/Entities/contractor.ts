import { Country } from "./country";
import { Customer } from "./customer";

export interface Contractor {
    id: number;
    version: number;
    createdAt: string; // ISO format: "2025-06-17T06:21:35.281056"
    updatedAt: string;

    customer: Customer | null;
    country: Country | null;

    label: string;
    name: string;
    number: number;
    street: string;
    zipCode: string;
    city: string;
    taxNumber: string;
  }
  