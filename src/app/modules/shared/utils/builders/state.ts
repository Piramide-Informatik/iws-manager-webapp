export function buildState(source: any): any {
    return {
        id: source?.id ?? 0,
        name: source?.name ?? '',
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0
    };
}