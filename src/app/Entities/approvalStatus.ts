export interface ApprovalStatus {
    id: number;
    createdAt: string; // ISO: "2025-06-17T06:21:35.281056"
    updatedAt: string;
    version: number;

    status: string;
    forProjects: number;
    forNetworks: number;
    sequenceNo: number;
}