import { Project } from "./project";

export interface ProjectPeriod {
  id: number;
  version: number;
  createdAt: string; // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  
  periodNo: number,
  startDate: string,
  endDate: string,
  project: Project
}
