import { Injectable, inject } from "@angular/core";
import { Observable, catchError, map, switchMap, take, throwError } from "rxjs";
import { Role } from "../../../../../Entities/role";
import { RoleService } from "../../../../../Services/role.service";
import { createNotFoundUpdateError, createUpdateConflictError } from "../../../../shared/utils/occ-error";

@Injectable({ providedIn: 'root' })
export class RoleUtils {
    private readonly roleService = inject(RoleService);

    loadInitialData(): Observable<Role[]> {
        return this.roleService.loadInitialData();
    }
    //Get a role by ID
    getRoleById(id: number): Observable<Role | undefined> {
        if (!id || id <= 0) {
            return throwError(() => new Error('Invalid role ID'));
        }
        return this.roleService.getRoleById(id).pipe(
            catchError(err => {
                console.error('Error fetching approvalStatus:', err);
                return throwError(() => new Error('Failed to load role'));
            })
        );
    }

    //Creates a new role with validation
    createNewRole(name: string): Observable<Role> {
        if (!name?.trim()) {
            return throwError(() => new Error('ProjectStatus name cannot be empty'));
        }
        return this.roleService.addRole({
            name: name?.trim()
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
        return new Observable<void>(suscriber => {
            this.roleService.refreshRoles();
            suscriber.next();
            suscriber.complete();
        });
    }
    //Delete a approvalStatus by Id
    deleteRole(id: number): Observable<void> {
        return this.roleService.deleteRole(id);
    }

    //Update a approvalStatus by ID and updates the internal approvalStatus signal
    updateRole(role: Role): Observable<Role> {
        if (!role?.id) {
            return throwError(() => new Error('Invalid role data'));
        }
        return this.roleService.getRoleById(role.id).pipe(
            take(1),
            switchMap((currentRole) => {
                if (!currentRole) {
                    return throwError(() => createNotFoundUpdateError('Role'));
                }
                if (currentRole.version !== role.version) {
                    return throwError(() => createUpdateConflictError('Role'));
                }
                return this.roleService.updateRole(role);
            }),
            catchError((err) => {
                console.error('Error updating role:', err);
                return throwError(() => err);
            })
        );
    }

    getAllRoles(): Observable<Role[]> {
        return this.roleService.getAllRoles().pipe(
            catchError(() => throwError(() => new Error('Failed to load contacts')))
        );
    }

}

