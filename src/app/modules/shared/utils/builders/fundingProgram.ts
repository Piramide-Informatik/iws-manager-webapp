export function buildFundingProgram(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        defaultFundingRate: source?.defaultFundingRate ?? 0,
        defaultHoursPerYear: source?.defaultHoursPerYear ?? 0,
        defaultResearchShare: source?.defaultResearchShare ?? 0,
        defaultStuffFlat: source?.defaultStuffFlat ?? 0,
        name: source?.name ?? ''
    };
}