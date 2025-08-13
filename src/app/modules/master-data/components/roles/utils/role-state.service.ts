import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Role } from "../../../../../Entities/role";

@Injectable({ providedIn: 'root' })
export class RoleStateService {
    private readonly editRoleSource = new BehaviorSubject<Role | null>(null);
    currentRole$ = this.editRoleSource.asObservable();
    
    setRoleToEdit(role: Role | null): void {
        this.editRoleSource.next(role);
    }
    
    clearRole() {
        this.editRoleSource.next(null);
    }
}