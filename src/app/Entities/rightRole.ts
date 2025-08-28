import { SystemFunction } from "./systemFunction";
import { Role } from "./role";

export interface RightRole {
    id: number;
    createdAt: string; // ISO: "2025-06-17T06:21:35.281056"
    updatedAt: string;
    version: number;

    accessRight?: number;
    sequenceNo?: number;
    role?: Role | null;
    systemFunction?: SystemFunction | null;
}