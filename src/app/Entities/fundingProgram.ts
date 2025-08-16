export interface FundingProgram {
  id: number;
  createdAt?: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt?: string;
  version?: number;

  defaultFundingRate?: number;
  defaultHoursPerYear?: number;
  defaultResearchShare?: number;
  defaultStuffFlat?: number;
  name?: string;
}