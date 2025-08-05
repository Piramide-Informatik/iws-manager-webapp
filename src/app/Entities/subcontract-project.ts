import { Project } from "./project";

export interface SubcontractProject {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;
  subcontractId: number;
  projectName: string;
  percentage: string;
  amount: string;
  project?: Project
}
