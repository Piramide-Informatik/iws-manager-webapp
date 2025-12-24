import { Employee } from "./employee";
import { Order } from "./order";

export interface OrderEmployee {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  employee: Employee | null;
  order: Order | null;

  hourlyRate: number;
  plannedHours: number;
  qualificationkmui: string;
}