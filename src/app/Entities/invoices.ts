import { Customer } from "./customer";
import { Order } from "./order";
import { PayCondition } from "./payCondition";

export interface Invoice {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  biller: null;
  invoiceType: null;
  network: null;
  customer: Customer | null;
  order: Order | null;
  payCondition: PayCondition | null;
  vat: null;
  cancelledInvoice: Invoice | null;

  invoiceNo?: number;
  invoiceDate?: number;
  invoiceTitle?: string;
  note?: string;
  amountNet?: number;
  amountTax?: number;
  amountGross?: number;
  amountOpen?: number;
  amountPaid?: number;
  comment?: string;
  isCancellation?: number;
  taxRate?: number;
  payDeadline?: string;
  paymentDate?: string;
  invoicePdf: Blob | null;
}
