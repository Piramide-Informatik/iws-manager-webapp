export interface Subcontract {
  orderId: number;
  contractor: string;
  invoiceNumber: string;
  invoiceDate: string; // o Date si estás usando ngModel con Date
  isNet: boolean;
  amount: number;
  afa: boolean;
  afaDuration?: number; // solo si afa = true
  description: string;
}
