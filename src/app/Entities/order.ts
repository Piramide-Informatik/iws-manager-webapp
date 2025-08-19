import { ApprovalStatus } from "./approvalStatus";
import { BasicContract } from "./basicContract";
import { Contractor } from "./contractor";
import { ContractStatus } from "./contractStatus";
import { CostType } from "./costType";
import { Customer } from "./customer";
import { EmployeeIws } from "./employeeIws";
import { FundingProgram } from "./fundingProgram";
import { Project } from "./project";
import { Promoter } from "./promoter";

export interface Order {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  approvalStatus: ApprovalStatus | null;  //----???
  basiccontract: BasicContract | null;   //------------form Master Agreement  contractNo + contractTitle 
  contractor: Contractor | null;        //----???
  contractStatus: ContractStatus | null;    //------------form 
  customer: Customer | null;                //------------form ??
  employeeIws: EmployeeIws | null;        //------------form  FirstName+LastName
  fundingProgram: FundingProgram | null;   //------------form  name
  orderType: CostType | null; // reference costtype //------------form NO HAY AUN
  project: Project | null; //------------form
  promoter: Promoter | null; //----???

  acronym?: string;       //------------form
  approvalDate?: string; //date //----???
  approvalPdf?: string; // Base64-encoded PDF
  contractData1?: string;  //----???
  contractData2?: string;  //----???
  contractPdf?: string;  // Base64-encoded PDF
  fixCommission?: number;  //------------form
  iwsProvision?: number;  //------------form Estimated
  maxCommission?: number;  //------------form
  nextDeptDate?: string;  //date //----???
  noOfDepts?: number;  //smallint  //----???
  orderDate?: string; //date  //------------form
  orderLabel?: string; //------------form  Order
  orderNo?: number; //------------form
  orderTitle?: string;  //------------form  Description
  orderValue?: number;  //------------form Estimated Order Value
  signatureDate?: string; //date //------------form
}