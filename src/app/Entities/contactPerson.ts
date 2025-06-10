import { Customer } from "./customer.model";

export interface ContactPerson {
    uuid: string;
    id: number;
    firstName: string;
    lastName: string;
    forInvoicing?: number;
    function?: string;     
    salutationId: number;
    titleId: number;
    customer?: Customer;   
}