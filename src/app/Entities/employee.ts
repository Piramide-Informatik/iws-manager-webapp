import { Salutation } from "./salutation";
import { Title } from "./title";
import { Customer } from "./customer";
import { QualificationFZ } from "../modules/employee/models/qualification-fz";

export class Employee {
    id!: number;
    version?: number;
    createdAt?: string;  // ISO 8601 string, LocalDateTime in the backend
    updatedAt?: string;  // ISO 8601 string, LocalDateTime in the backend
    
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
    generalmanagersince?: string;  // ISO date string, LocalDate in backend
    shareholdersince?: string;     // ISO date string, LocalDate in backend
    soleproprietorsince?: string;  // ISO date string, LocalDate in backend
    coentrepreneursince?: string;  // ISO date string, LocalDate in backend
    
    // Calificaciones
    qualificationkmui?: string;

    // Relaciones comentadas temporalmente (para futuras implementaciones)
    // absenceDays?: AbsenceDay[];
    // employmentContracts?: EmploymentContract[];
    // projects?: Project[];
}
