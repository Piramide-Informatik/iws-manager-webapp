import { ExcelImportRow } from "./excelImportRow";

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  data: ExcelImportRow[];
}