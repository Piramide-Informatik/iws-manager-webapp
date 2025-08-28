export interface Column {
  field: string;
  header: string;
  minWidth?: number;
  filter?: { 
    type: 'multiple' | 'boolean', 
    data: any 
  };
  customExportHeader?: string;
  routerLink?: (row: any) => string;
  type?: 'double' | 'date' | 'dateYear';
  customClasses?: string[];
  useSameAsEdit?: boolean;
}