import { Order } from "./order";

export interface OrderCommission {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  order: Order | null;

  fromOrderValue?: number;
  commission?: string;
  minCommission?: string;
}