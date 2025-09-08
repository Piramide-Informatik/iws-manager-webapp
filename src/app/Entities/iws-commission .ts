export interface IwsCommission{
    id: number;
    createdAt: string;  // ISO 8601 string, LocalDateTime in the backend
    updatedAt: string;  // ISO 8601 string, LocalDateTime in the backend
    version?: number;    // Version number of the entity

    commission?: number;
    fromOrderValue?: number;
    invoiceText?: string;
    minCommission?: number;
    payDeadline?: number;
}
