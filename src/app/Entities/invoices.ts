import { Order } from "./order";

export interface Invoice {
  id: number
  invoiceNo: string;
  invoiceDate: string;
  note: string;
  invoiceType: InvoiceType;
  network: Network;
  order: Order
  value: number;
  amountNet: number;
  amountTax: number;
  amountGross: number;
  version?: number;
}

export interface InvoiceType {
  name: string
}

export interface Network {
  networkName: string
}
