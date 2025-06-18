import { Country } from "./country";
import { Branch } from "./branch";
import { CompanyType } from "./companyType";
import { State } from "./state";

export interface Customer {
    id: number;
    createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
    updatedAt: string;

    branch?: Branch;
    city?: string;
    companytype?: CompanyType;
    country: Country;
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

    state?: State;
    street?: string;
    taxno?: string;
    taxoffice?: string;
    zipcode?: string;
}
