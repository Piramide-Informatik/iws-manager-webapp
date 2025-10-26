export interface RightRole {
    id?: number;
    createdAt?: string; // ISO: "2025-06-17T06:21:35.281056"
    updatedAt?: string;
    version?: number;

    accessRight?: number;
    sequenceNo?: number;
    role: { id: number; name?: string };
    systemFunction: { id: number; functionName?: string; sequenceNo?: number };
}