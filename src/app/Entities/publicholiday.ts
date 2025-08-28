export interface PublicHoliday{
    id: number;
    createdAt: string; // ISO: "2025-06-17T06:21:35.281056"
    updatedAt: string;
    version: number;

    name?: string;
    isFixedDate: boolean;
    sequenceNo?: number;
    date?: string; // ISO: "2025-06-17"
    
}