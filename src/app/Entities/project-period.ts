import { Project } from "./project";

export interface ProjectPeriod {
  periodNo: number,
  startDate: string,
  endDate: string,
  project: Project
}
