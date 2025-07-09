export function buildCountry(source: any): any {
    return {
        id: source?.id ?? 0,
        name: source?.name ?? '',
        label: source?.label ?? '',
        isDefault: source?.isDefault ?? false,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0
    };
}