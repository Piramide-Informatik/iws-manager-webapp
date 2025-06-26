import { Branch } from './branch';
import { CompanyType } from './companyType';
import { Country } from './country';
import { State } from './state';

export interface Customer {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  branch: Branch | null; 
  city?: string;
  companytype: CompanyType | null; 
  country: Country | null; 
  customerno?: number;

  customername1?: string;
  customername2?: string;

  email1?: string;
  email2?: string;
  email3?: string;
  email4?: string;

  homepage?: string;
  hoursperweek?: number;
  maxhoursmonth?: number;
  maxhoursyear?: number;

  note?: string;
  phone?: string;

  state: State | null; 
  street?: string;
  taxno?: string;
  taxoffice?: string;
  zipcode?: string;
}
