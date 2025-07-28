export interface Subcontract {
  id: number;
  createdAt: string;   // ISO format: "2025-06-17T06:21:35.281056"
  updatedAt: string;
  version: number;
  contractTitle: string;
  orderId: number;
  contractor: any;
  invoiceNumber: string;
  invoiceDate: string; // o Date si estás usando ngModel con Date
  isNet: boolean;
  amount: number;
  afa: boolean;
  afaDuration?: number; // solo si afa = true
  description: string;
  projectCostCenter: any
  invoiceNet: number
  invoiceGross: number
}
