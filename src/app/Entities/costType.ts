export interface CostType {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  type?: string;
  sequenceNo?: number; //smallint
}