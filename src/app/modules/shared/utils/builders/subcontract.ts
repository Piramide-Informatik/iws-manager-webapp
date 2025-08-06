import { buildContractor } from "./contractor";
import { buildCustomer } from "./customer";

export function buildSubcontract(source: any): any {
  return {
    id: source?.id ?? 0,
    createdAt: source?.createdAt ?? '',
    updatedAt: source?.updatedAt ?? '',
    version: source?.version ?? 0,
    contractTitle: source?.contractTitle ?? '',
    description: source?.description ?? '',
    date: source?.date ?? '',
    invoiceNo: source?.invoiceNo ?? '',
    invoiceDate: source?.invoiceDate ?? '',
    invoiceAmount: source?.invoiceAmount ?? 0,
    invoiceNet: source?.invoiceNet ?? 0,
    invoiceGross: source?.invoiceGross ?? 0,
    netOrGross: source?.netOrGross ?? true,
    isAfa: source?.isAfa ?? false,
    afamonths: source?.afamonths ?? 0,
    note: source?.note ?? '',
    projectCostCenter: source?.projectCostCenter ?? null,
    customer: buildCustomer(source?.customer), 
    contractor: buildContractor(source?.contractor)
  };
}
