import { AbsenceType } from "./absenceType";
import { Employee } from "./employee";

export interface AbsenceDay {
    id: number;
    createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
    updatedAt: string;
    version: number;

    absenceType: AbsenceType | null;
    employee: Employee | null;

    absenceDate?: string; // date
}