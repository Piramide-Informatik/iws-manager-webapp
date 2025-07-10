import { buildBranch } from "./branch";
import { buildCompanyType } from "./company-type";
import { buildCountry } from "./country";
import { buildState } from "./state";

export function buildCustomer(source: any, options?: {
    includeEmptyDates?: boolean
}): any {
    const defaultDate = options?.includeEmptyDates ? '' : new Date().toISOString();

    return {
        id: source?.id ?? 0,
        version: source?.version ?? 0,
        createdAt: source?.createdAt ?? defaultDate,
        updatedAt: source?.updatedAt ?? defaultDate,
        customername1: source?.customername1 ?? '',
        customername2: source?.customername2 ?? '',
        email1: source?.email1 ?? '',
        email2: source?.email2 ?? '',
        phone: source?.phone ?? '',
        street: source?.street ?? '',
        city: source?.city ?? '',
        zipcode: source?.zipcode ?? '',
        taxno: source?.taxno ?? '',
        homepage: source?.homepage ?? '',
        branch: buildBranch(source?.branch),
        companytype: buildCompanyType(source?.companytype),
        country: buildCountry(source?.country),
        state: buildState(source?.state)
    };
}