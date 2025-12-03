import { Employee } from "./employee";
import { Project } from "./project";

export interface ProjectEmployee {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  employee: Employee | null;
  project: Project | null;

  hourlyRate: number;
  plannedHours: number;
  qualificationkmui: string;
}