import { Salutation } from "./salutation";
import { Title } from "./title";
import { Customer } from "./customer";
import { QualificationFZ } from "../modules/employee/models/qualification-fz";

export class Employee {
    id!: number;
    version?: number;
    createdAt?: string;  
    updatedAt?: string;  
    
    // Propiedades básicas
    firstname!: string;
    lastname!: string;
    email?: string;
    phone?: string;
    label?: string;
    employeeno?: number;
    
    // Relaciones con otras entidades
    salutation?: Salutation;
    title?: Title;
    customer?: Customer;
    qualificationFZ?: QualificationFZ;
    
    // Fechas importantes
    generalmanagersince?: string;  
    shareholdersince?: string;     
    soleproprietorsince?: string;  
    coentrepreneursince?: string;  
    
    // Calificaciones
    qualificationkmui?: string;

}
