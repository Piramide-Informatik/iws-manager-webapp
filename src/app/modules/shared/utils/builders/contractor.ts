import { buildCountry } from "./country";

export function buildContractor(source: any): any {
    return {
    id: source?.id ?? 0,
    label: source?.label ?? '',
    name: source?.name ?? '',
    number: source?.number ?? 0,
    country: buildCountry(source?.country),
    street: source?.street ?? '',
    zipCode: source?.zipCode ?? '',
    city: source?.city ?? '',
    taxNumber: source?.taxNumber ?? '',
    customer: source?.customer ?? null,
    createdAt: source?.createdAt ?? '',
    updatedAt: source?.updatedAt ?? '',
    version: source?.version ?? 0
  };
}