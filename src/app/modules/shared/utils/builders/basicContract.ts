import { buildContractStatus } from "./contractStatus";
import { buildCustomer } from "./customer";
import { buildEmployeeIws } from "./employeeIws";
import { buildFundingProgram } from "./fundingProgram";

export function buildBasicContract(source: any): any {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        contractStatus: buildContractStatus(source?.contractStatus),
        customer: buildCustomer(source?.customer),
        fundingProgram: buildFundingProgram(source?.fundingProgram),
        employeeIws: buildEmployeeIws(source?.employeeIws),

        confirmationDate: source?.confirmationDate ?? '',
        contractLabel: source?.contractLabel ?? '',
        contractNo: source?.contractNo ?? 0,
        contractTitle: source?.contractTitle ?? '',
        date: source?.date ?? ''
    };
}