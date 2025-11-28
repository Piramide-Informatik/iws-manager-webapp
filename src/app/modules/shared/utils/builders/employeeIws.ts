// builders/employeeIws.ts
export function buildEmployeeIws(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        teamIws: source?.teamIws,
        user: source?.user,

        active: source?.active ?? 0,
        employeeLabel: source?.employeeLabel ?? '',
        employeeNo: source?.employeeNo ?? 0,
        endDate: source?.endDate ?? '',
        firstname: source?.firstname ?? '',
        lastname: source?.lastname ?? '',
        mail: source?.mail ?? '',
        startDate: source?.startDate ?? ''
    };
}