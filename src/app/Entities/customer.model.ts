import { Country } from "./country";
import { Branch } from "./branch";
import { CompanyType } from "./companyType";
import { State } from "./state";

export interface Customer {
    id: number;
    branch: Branch | null;
    city: string | null;
    companytype: CompanyType | null;
    country: Country | null;
    customerno: number | null;
    customername1: string | null;
    customername2: string | null;
    email1: string | null;
    email2: string | null;
    email3: string | null;
    email4: string | null;
    homepage: string | null;
    hoursperweek: string | null;
    maxhoursmonth: string | null;
    maxhoursyear: string | null;
    note: string | null;
    phone: string | null;
    state: State | null;
    street: string | null;
    taxno: string | null;
    taxoffice: string | null;
    zipcode: string | null;
    createdAt?: string;
    updatedAt?: string;
    version?: number;
}
