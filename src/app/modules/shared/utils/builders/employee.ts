import { buildSalutation } from "./salutation";
import { buildTitle } from "./title";

export function buildEmployee(source: any, options?: {
    includeEmptyDates?: boolean
}): any {
    const defaultDate = options?.includeEmptyDates ? '' : new Date().toISOString();

    return {
        id: source?.id ?? 0,
        employeeno: source?.employeeno ?? '',
        salutation: buildSalutation(source?.salutation),
        title: buildTitle(source?.title),
        firstname: source?.firstname ?? '',
        lastname: source?.lastname ?? '',
        createdAt: source?.createdAt ?? defaultDate,
        updatedAt: source?.updatedAt ?? defaultDate,
        version: source?.version ?? 0,
    };
}