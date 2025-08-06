import { Project } from "./project";
import { Subcontract } from "./subcontract";
import { SubcontractYear } from "./subcontract-year";

export interface SubcontractProject {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;
  
  subcontractYear: SubcontractYear | null;
  project: Project | null;
  subcontract: Subcontract | null;

  amount?: Number;
  months?: Number;
  share?: Number;
  year?: String;
}
