export interface Column {
  field: string;
  header: string;
  minWidth?: number;
  filter?: { 
    type: 'multiple' | 'boolean' | 'numeric', 
    data?: any 
  };
  styles?: {},
  routerLink?: (row: any) => string;
  type?: 'double' | 'integer' | 'date' | 'dateYear';
  customClasses?: string[];
  classesTHead?: string[];
  useSameAsEdit?: boolean;
}