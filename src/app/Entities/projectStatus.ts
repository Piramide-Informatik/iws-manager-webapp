export interface ProjectStatus {
    id: number;
    name: string;
    createdAt: string;  // ISO 8601 string, LocalDateTime in the backend
    updatedAt: string;  // ISO 8601 string, LocalDateTime in the backend
    version: number;
}