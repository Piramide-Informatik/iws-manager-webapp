import { PublicHoliday } from "./publicholiday";

export interface HolidayYear {
    id: number;
    date: string;
    weekday: number;
    year: string;
    publicHoliday: PublicHoliday;

    createdAt: string;  // ISO format: "2025-06-17T06:21:35.281056"
    updatedAt: string;  // ISO format: "2025-06-17T06:21:35.281056"
    version: number;
}