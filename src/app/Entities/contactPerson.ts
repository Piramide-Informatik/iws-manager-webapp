import { Customer } from "./customer.model";
import { Title } from "@angular/platform-browser";
import { Salutation } from "./salutation";
import { Customer } from "./customer.model";


export interface ContactPerson {
    id: number;
    firstName: string;
    lastName: string;
    forInvoicing: number;
    function?: string;     
    salutation: Salutation;
    title: Title;
    customer?: Customer;  
}
