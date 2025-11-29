import { momentFormatDate } from "../moment-date-utils"

export function buildProject(source: any): any {
  return {
    id: source?.id ?? 0,
    createdAt: source?.createdAt ?? '',
    updatedAt: source?.updatedAt ?? '',
    version: source?.version ?? 0,
    projectLabel: source?.projectLabel ?? '',
    projectName: source?.projectName ?? '',
    title: source?.title ?? '',
    note: source?.note ?? '',
    chance: source?.chance ?? 0,
    startDate: momentFormatDate(source?.startDate ?? ''),
    endDate: momentFormatDate(source?.endDate ?? ''),
    startApproval: momentFormatDate(source?.startApproval ?? ''),
    endApproval: source?.endApproval ?? '',
    date1: source?.date1 ?? '',
    date2: source?.date2 ?? '',
    date3: source?.date3 ?? '',
    date4: source?.date4 ?? '',
    date5: source?.date5 ?? '',
    dateLevel1: source?.dateLevel1 ?? '',
    dateLevel2: source?.dateLevel2 ?? '',
    fundingLabel: source?.fundingLabel ?? '',
    fundingRate: source?.fundingRate ?? 0,
    financeAuthority: source?.financeAuthority ?? '',
    shareResearch: source?.shareResearch ?? 0,
    hourlyRateMueu: source?.hourlyRateMueu ?? 0,
    income1: source?.income1 ?? 0,
    income2: source?.income2 ?? 0,
    income3: source?.income3 ?? 0,
    income4: source?.income4 ?? 0,
    income5: source?.income5 ?? 0,
    donation: source?.donation ?? 0,
    productiveHoursPerYear: source?.productiveHoursPerYear ?? 0,
    maxHoursPerMonth: source?.maxHoursPerMonth ?? 0,
    maxHoursPerYear: source?.maxHoursPerYear ?? 0,
    stuffFlat: source?.stuffFlat ?? 0,

    // relations - just id and version
    orderFue: source?.orderFue ? { id: source.orderFue.id, version: source.orderFue.version ?? 0 } : null,
    orderAdmin: source?.orderAdmin ? { id: source.orderAdmin.id, version: source.orderAdmin.version ?? 0 } : null,
    customer: source?.customer ? { id: source.customer.id, version: source.customer.version ?? 0 } : null,
    fundingProgram: source?.fundingProgram ? { id: source.fundingProgram.id, version: source.fundingProgram.version ?? 0 } : null,
    promoter: source?.promoter ? { id: source.promoter.id, version: source.promoter.version ?? 0 } : null,

    authorizationDate: momentFormatDate(source?.authorizationDate ?? ''),
    approvalDate: momentFormatDate(source?.approvalDate ?? '')
  };
}