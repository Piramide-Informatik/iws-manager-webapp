export interface Salutation {
    id: number;
    name: string;
    createdAt: string;  // ISO 8601 string, LocalDateTime in the backend
    updatedAt: string;  // ISO 8601 string, LocalDateTime in the 
    version: number;
}
