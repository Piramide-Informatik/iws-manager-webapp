import { Biller } from "./biller";
import { Customer } from "./customer";
import { InvoiceType } from "./invoiceType";
import { Network } from "./network";
import { Order } from "./order";
import { PayCondition } from "./payCondition";
import { Vat } from "./vat";

export interface Invoice {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;

  biller: Biller | null;
  customer: Customer | null;
  payCondition: PayCondition | null;
  cancelledInvoice: Invoice | null;
  order: Order | null;
  network: Network | null;
  invoiceType: InvoiceType | null;
  vat: Vat | null;

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
