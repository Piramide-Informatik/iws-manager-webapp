import { buildEmployeeIws } from "./employeeIws";

export function buildTeamIws(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        teamleader: source?.teamleader ?? 0,
        teamiws: source?.teamiws ?? '',
        name: source?.name ?? '',
        teamLeader: buildEmployeeIws(source?.teamLeader)
    };
}