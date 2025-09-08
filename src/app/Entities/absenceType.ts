export interface AbsenceType {
    id: number;
    createdAt: string; // ISO: "2025-06-17T06:21:35.281056"
    updatedAt: string;
    version: number;

    name?: string;
    label?: string;
    shareOfDay?: number; //decimal max 1.0
    isHoliday?: number; //boolean 1 or 0
    hours?: number; //boolean 1 or 0
}