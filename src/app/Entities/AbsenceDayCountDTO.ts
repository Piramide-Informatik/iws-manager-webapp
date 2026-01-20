import { AbsenceType } from "./absenceType";

export interface AbsenceDayCountDTO {
    absenceType: AbsenceType | null;
    count: number;
    calculatedCount: number;
}
