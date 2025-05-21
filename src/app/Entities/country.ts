export interface Country {
    id: number;
    name: string;
    label: string;
    isDefault: boolean;
    createdAt: string;  // ISO 8601 string, LocalDateTime in the backend
    updatedAt: string;  // ISO 8601 string, LocalDateTime in the backend
}