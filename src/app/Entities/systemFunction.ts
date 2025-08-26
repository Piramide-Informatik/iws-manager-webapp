import { SystemModule } from "./systemModule";

export interface SystemFunction {
    id: number;
    createdAt: string; // ISO: "2025-06-17T06:21:35.281056"
    updatedAt: string;
    version: number;

    functionName?: string;
    sequenceNo?: number;
    module?: SystemModule | null
}