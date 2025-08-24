import { Customer } from "./customer";
import { Order } from "./order";
import { Project } from "./project";
import { Promoter } from "./promoter";

export interface Debt {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  customer: Customer | null;
  order: Order | null;
  project: Project | null;
  promoter: Promoter | null;

  billingEnd?: string; //date
  billingmonths?: number;
  billingStart?: string; //date
  comment?: string;
  confdatelevel1?: string; //date
  confdatelevel2?: string; //date
  date?: string; //date
  debtNo?: number; 
  debttitle?: string;
  donation?: number; 
  fundinglabel?: string;
  grossAmount?: number;
  iwsdeptamount1?: number;
  iwsdeptamount2?: number;
  iwsPercent?: number;
  kmui0838?: number;
  kmui0848?: number;
  kmui0847?: number;
  kmui0850?: number;
  kmui0856?: number;
  kmui0860?: number;
  lastpaymentdate?: string; // date
  netAmount?: number; 
  openAmount?: number;
  payedAmount?: number;
  projectcosts?: number;
  projectend?: string;  // date
  projectstart?: string;  // date
  requestno?: number;
  taxamount?: number;
}