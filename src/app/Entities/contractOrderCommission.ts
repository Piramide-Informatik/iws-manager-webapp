import { EmploymentContract } from "./employment-contract";
import { BasicContract } from "./basicContract"; // Añadir import

export interface ContractOrderCommission {
  id: number;
  createdAt: string;
  updatedAt: string;
  version: number;

  basicContract: BasicContract | null; // Cambiar de employmentContact a basicContract
  employmentContact: EmploymentContract | null; // Mantener si existe, o eliminar si no se usa

  fromOrderValue: number;
  commission: number;
  minCommission: number;
}