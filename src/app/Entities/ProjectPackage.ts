import { Project } from "./project";

export interface ProjectPackage {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  project: Project;
  packageNo: number;
  serial: string;
  packageTitle: string;
  startDate: string;
  endDate: string;
}
