export function buildPromoter(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        country: source?.country,

        city: source?.city ?? '',
        projectPromoter: source?.projectPromoter ?? '',
        promoterName1: source?.promoterName1 ?? '',
        promoterName2: source?.promoterName2 ?? '',
        promoterNo: source?.promoterNo ?? '',
        street: source?.street ?? '',
        zipCode: source?.zipCode ?? ''
    };
}