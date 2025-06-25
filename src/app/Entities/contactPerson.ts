import { Customer } from "./customer";
import { Salutation } from "./salutation";
import { Title } from "./title";


export interface ContactPerson {
    id: number;
    createdAt?: string; // ISO: "2025-06-17T06:21:35.281056"
    updatedAt?: string;
    version?: number;

    customer?: Customer;
    firstName?: string;
    forInvoicing?: number;
    function?: string;
    lastName?: string;
    email?: string;

    salutation?: Salutation;
    title?: Title;
}
