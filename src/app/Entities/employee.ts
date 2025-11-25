import { Salutation } from "./salutation";
import { Customer } from "./customer";
import { Title } from "./title";
import { QualificationFZ } from "./qualificationfz";
import { EmployeeCategory } from "./employee-category ";

export type EmployeeDate = string | Date | null;

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

    generalmanagersince?: EmployeeDate;
    shareholdersince?: EmployeeDate;
    soleproprietorsince?: EmployeeDate;
    coentrepreneursince?: EmployeeDate;

    qualificationFZ?: QualificationFZ | null;
    employeeCategory?: EmployeeCategory | null;
    qualificationkmui?: string;
}
