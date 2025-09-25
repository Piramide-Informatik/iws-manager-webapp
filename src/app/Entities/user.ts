import { Role } from "./role";

export interface User{
    id: number;
    createdAt: string;  // ISO 8601 string, LocalDateTime in the backend
    updatedAt: string;  // ISO 8601 string, LocalDateTime in the backend
    version: number;

    username: string;
    password?: string;
    active?: boolean;
    email?: string;
    firstName?: string;
    lastName?: string;
    roles?: Role[] | null;
}