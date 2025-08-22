import { SubcontractProject } from '../../../../Entities/subcontract-project';
import { buildProject } from './project';
import { buildSubcontract } from './subcontract';
import { buildSubcontractYear } from './subcontract-year';

export function buildSubcontractProject(source: any): SubcontractProject {
    return {
        id: source?.id ?? 0,
        createdAt: source?.createdAt ?? '',
        updatedAt: source?.updatedAt ?? '',
        version: source?.version ?? 0,

        subcontractYear: buildSubcontractYear(source?.subcontractYear),
        project: buildProject(source?.project),
        subcontract: buildSubcontract(source?.subcontract),

        amount: source?.amount ?? 0,
        share: source?.share ?? 0
    };
}
