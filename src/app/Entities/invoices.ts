export interface Invoice {
  invoiceNumber: string;
  date: string;
  description: string;
  type: string;
  iwsNumber: string;
  orderNumber: string;
  orderName: string;
  value: number;
  netAmount: number;
  totalAmount: number;
}
