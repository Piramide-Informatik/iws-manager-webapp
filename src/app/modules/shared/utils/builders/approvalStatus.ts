// builders/approvalStatus.ts
export function buildApprovalStatus(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        status: source?.status ?? '',
        forProjects: source?.forProjects ?? 0,
        forNetworks: source?.forNetworks ?? 0,
        sequenceNo: source?.sequenceNo ?? 0
    };
}