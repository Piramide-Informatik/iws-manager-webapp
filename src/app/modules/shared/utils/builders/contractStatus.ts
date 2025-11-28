export function buildContractStatus(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        chance: source?.chance ?? 0,
        status: source?.status ?? ''
    };
}