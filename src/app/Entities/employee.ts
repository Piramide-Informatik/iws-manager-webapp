import { Salutation } from "./salutation";
import { Customer } from "./customer";
import { Title } from "./title";
import { QualificationFZ } from "./qualificationfz";

export interface Employee {
    id: number;
    version: number;
    createdAt: string; // ISO format: "2025-06-17T06:21:35.281056"
    updatedAt: string;

    customer?: Customer | null;
    
    employeeno?: number;
    salutation?: Salutation | null;
    title?: Title | null;

    firstname?: string;
    lastname?: string;
    email?: string;

    label?: string;
    phone?: string;

    generalmanagersince?: string | Date | null;
    shareholdersince?: string | Date | null;
    soleproprietorsince?: string | Date | null;
    coentrepreneursince?: string | Date | null;

    qualificationFZ?: QualificationFZ | null;
    qualificationkmui?: string;
}
