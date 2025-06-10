import { Title } from "@angular/platform-browser";
import { Salutation } from "./salutation";
import { Customer } from "./customer";

export interface ContactPerson {
    id: number;
    firstName: string;
    lastName: string;
    forInvoincing?: number;
    function?: string;     
    salutation: Salutation;
    title: Title;
    customer?: Customer;  
}