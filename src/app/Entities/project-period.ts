import { Project } from "./project";

export interface ProjectPeriod {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  project: Project;

  periodNo: string;
  startDate: string;
  endDate: string;
}
