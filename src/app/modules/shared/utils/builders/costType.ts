export function buildCostType(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        type: source?.type ?? '',
        sequenceNo: source?.sequenceNo ?? 0
    };
}