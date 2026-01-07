export function buildOrder(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        // Relations
        approvalStatus: source?.approvalStatus ? { id: source.approvalStatus.id, version: source.approvalStatus.version ?? 0 } : null,
        basiccontract: source?.basiccontract ? { id: source.basiccontract.id, version: source.basiccontract.version ?? 0 } : null,
        contractor: source?.contractor ? { id: source.contractor.id, version: source.contractor.version ?? 0 } : null,
        contractStatus: source?.contractStatus ? { id: source.contractStatus.id, version: source.contractStatus.version ?? 0 } : null,
        customer: source?.customer ? { id: source.customer.id, version: source.customer.version ?? 0 } : null,
        employeeIws: source?.employeeIws ? { id: source.employeeIws.id, version: source.employeeIws.version ?? 0 } : null,
        fundingProgram: source?.fundingProgram ? { id: source.fundingProgram.id, version: source.fundingProgram.version ?? 0 } : null,
        orderType: source?.orderType ? { id: source.orderType.id, version: source.orderType.version ?? 0 } : null,
        project: source?.project ? { id: source.project.id, version: source.project.version ?? 0 } : null,
        promoter: source?.promoter ? { id: source.promoter.id, version: source.promoter.version ?? 0 } : null,

        // Fields
        acronym: source?.acronym ?? '',
        approvalDate: source?.approvalDate ?? '',
        approvalPdf: source?.approvalPdf ?? '',
        contractData1: source?.contractData1 ?? '',
        contractData2: source?.contractData2 ?? '',
        contractPdf: source?.contractPdf ?? '',
        fixCommission: source?.fixCommission ?? 0,
        iwsProvision: source?.iwsProvision ?? 0,
        maxCommission: source?.maxCommission ?? 0,
        nextDeptDate: source?.nextDeptDate ?? '',
        noOfDepts: source?.noOfDepts ?? 0,
        orderDate: source?.orderDate ?? '',
        orderLabel: source?.orderLabel ?? '',
        orderNo: source?.orderNo ?? 0,
        orderTitle: source?.orderTitle ?? '',
        orderValue: source?.orderValue ?? 0,
        signatureDate: source?.signatureDate ?? ''
    };
}