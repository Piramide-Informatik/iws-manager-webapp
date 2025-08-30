export interface Column {
  field: string;
  header: string;
  minWidth?: number;
  filter?: { 
    type: 'multiple' | 'boolean', 
    data?: any 
  };
  styles?: {},
  routerLink?: (row: any) => string;
  type?: 'double' | 'date' | 'dateYear';
  customClasses?: string[];
  useSameAsEdit?: boolean;
}