import { Injectable, inject } from "@angular/core";
import { Observable, catchError, map, of, switchMap, take, throwError } from "rxjs";
import { Role } from "../../../../../Entities/role";
import { RoleService } from "../../../../../Services/role.service";

@Injectable({ providedIn: 'root' })
export class RoleUtils { 
    private readonly roleService = inject(RoleService);
    
    loadInitialData(): Observable<Role[]> {
        return this.roleService.loadInitialData();
    }
    //Get a role by ID
    getRoleById(id: number): Observable<Role | undefined> {
        if (!id || id <= 0) {
            return throwError(() => new  Error('Invalid role ID'));
        }
        return this.roleService.getRoleById(id).pipe(
            catchError(err => {
                console.error('Error fetching approvalStatus:', err);
                return throwError(() => new Error('Failed to load role'));
            })
        );
    }

    //Creates a new role with validation
    createNewRole(name: string): Observable<void> {
        if (!name?.trim()) {
            return throwError(() => new Error('ProjectStatus name cannot be empty'));
        }
        return new Observable<void>(subscriber => {
            this.roleService.addRole({
                name: name?.trim()
            });
            subscriber.next();
            subscriber.complete();
        });
    }

    //Check if an role already exists
    roleExists(name: string): Observable<boolean> {
        
        return this.roleService.getAllRoles().pipe(
            map(role => role.some(
                t => t.name.toLowerCase() === name.toLowerCase()
            )),
            catchError(err => {
                console.error('Error checking role existence:', err);
                return throwError(() => new Error('Failed to check role existence'));
            })
        );
        
    }

    //Refreshes role data
    refreshRoles(): Observable<void> {
        return new Observable<void>(suscriber =>{
            this.roleService.refreshRoles();
            suscriber.next();
            suscriber.complete();
        });
    }
    //Delete a approvalStatus by Id
    deleteRole(id: number): Observable<void> {
        return this.checkApprovalStatusUsage(id).pipe(
            switchMap((isUsed: boolean): Observable<void> => 
            isUsed
                ? throwError(() => new Error('Cannot delete register: it is in use by other entities'))
                : this.roleService.deleteRole(id)
        ),
            catchError(error => {
                return throwError(() => error);
            })
        )
    }

    private checkApprovalStatusUsage(idRole: number): Observable<boolean> {
        // For now, no use has been verified in any entity.
        return of(false);
    }

    //Update a approvalStatus by ID and updates the internal approvalStatus signal
    updateRole(role: Role): Observable<Role> {
        if (!role?.id) {
            return throwError(() => new Error('Invalid role data'));
        }
        return this.roleService.getRoleById(role.id).pipe(
            take(1),
            map((currentRole) => {
                if (!currentRole) {
                    throw new Error('Role not found');
                }
                if (currentRole.version !== role.version) {
                    throw new Error('Version conflict: role has been updated by another user');
                }
                return role;
            }),
            switchMap((validatedRole: Role) => this.roleService.updateRole(validatedRole)),
            catchError((err) => {
                console.error('Error updating role:', err);
                return throwError(() => err);
            })
        );
    }

}

