import { buildApprovalStatus } from "./approvalStatus";
import { buildBasicContract } from "./basicContract";
import { buildContractor } from "./contractor";
import { buildContractStatus } from "./contractStatus";
import { buildCostType } from "./costType";
import { buildCustomer } from "./customer";
import { buildEmployeeIws } from "./employeeIws";
import { buildFundingProgram } from "./fundingProgram";
import { buildProject } from "./project";
import { buildPromoter } from "./promoter";


export function buildOrder(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        // Relaciones
        approvalStatus: buildApprovalStatus(source?.approvalStatus),
        basiccontract: buildBasicContract(source?.basiccontract),
        contractor: buildContractor(source?.contractor),
        contractStatus: buildContractStatus(source?.contractStatus),
        customer: buildCustomer(source?.customer),
        employeeIws: buildEmployeeIws(source?.employeeIws),
        fundingProgram: buildFundingProgram(source?.fundingProgram),
        orderType: buildCostType(source?.orderType),
        project: buildProject(source?.project),
        promoter: buildPromoter(source?.promoter),

        // Campos opcionales
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