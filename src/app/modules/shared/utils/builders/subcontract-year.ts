import { buildSubcontract } from "./subcontract";

export function buildSubcontractYear(source: any): any {
  return {
    id: source?.id ?? 0,
    createdAt: source?.createdAt ?? '',
    updatedAt: source?.updatedAt ?? '',
    version: source?.version ?? 0,
    months: source?.months ?? 0,
    year: source?.year ?? '',
    subcontract: buildSubcontract(source?.subcontract)
  };
}
