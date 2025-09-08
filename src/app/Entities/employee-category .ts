export interface EmployeeCategory{
    id: number;
    createdAt: string;  // ISO 8601 string, LocalDateTime in the backend
    updatedAt: string;  // ISO 8601 string, LocalDateTime in the backend
    version?: number;    // Version number of the entity

    label?: string;
    title: string;
}