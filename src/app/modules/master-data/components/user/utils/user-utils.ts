import { Injectable, inject } from "@angular/core";
import { Observable, catchError, take, throwError, switchMap, of, tap, map } from "rxjs";
import { User } from "../../../../../Entities/user";
import { RoleUtils } from "../../roles/utils/role-utils";
import { UserService } from "../../../../../Services/user.service";
import { Role } from "../../../../../Entities/role";
import { createNotFoundUpdateError, createUpdateConflictError } from "../../../../shared/utils/occ-error";

@Injectable({
    providedIn: 'root'
})
export class UserUtils {
    private _error: string | null = null;
    private readonly userService = inject(UserService);
    private readonly roleUtils = inject(RoleUtils);

    loadInitialData(): Observable<User[]> {
        return this.userService.loadInitialData();
    }


    getUseryId(id: number): Observable<User | undefined> {
        if (!id || id <= 0) {
            return throwError(() => new Error('Invalid user ID'));
        }

        return this.userService.getUserById(id).pipe(
            catchError(err => {
                console.error('Error fetching user:', err);
                return throwError(() => new Error('Failed to load user'));
            })
        );
    }

    addUser(user: Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<User> {
        return this.userExists(user.username).pipe(
            switchMap((exists) => {
                if (exists) {
                    return throwError(() => new Error('username already exists'));
                }

                return this.userService.addUser(user);
            }),
            catchError((err) => {
                if (err.message === 'username already exists') {
                    return throwError(() => err);
                }

                return throwError(() => new Error('PROJECT_STATUS.ERROR.CREATION_FAILED'));
            })
        );
    }

    /**
      * Checks if a user exists by user.username (case-insensitive comparison)
      * @param user.username - User username to check
      * @returns Observable emitting boolean indicating existence
      */
    private userExists(username: string): Observable<boolean> {
        return this.userService.getAllUser().pipe(
            map(users => users.some(
                u => u.id !== null && u.username?.toString().toLowerCase() === username.toString().toLowerCase()
            )),
            catchError(() => {
                return throwError(() => new Error('Failed to check user existence'));
            })
        );
    }

    getAllUsers(): Observable<User[]> {
        return this.userService.getAllUser();
    }

    refreshUsers(): Observable<void> {
        return new Observable<void>(subscriber => {
            this.userService.loadInitialData();
            subscriber.next();
            subscriber.complete();
        });
    }

    deleteUser(id: number): Observable<void> {
        return this.userService.deleteUser(id).pipe(
            catchError(error => throwError(() => error))
        );
    }

    updateUsers(user: User): Observable<User> {
        if (!user?.id) {
            return throwError(() => new Error('Invalid user data'));
        }

        return this.userService.getUserById(user.id).pipe(
            take(1),
            switchMap((currentUser) => {
                if (!currentUser) {
                    return throwError(() => createNotFoundUpdateError('User'));
                }
                if (currentUser.version !== user.version) {
                    return throwError(() => createUpdateConflictError('User'));
                }
                
                return this.userExists(user.username).pipe(
                    switchMap((exists) => {
                        if (exists && currentUser.username.toLowerCase() !== user.username.toLowerCase()) {
                            return throwError(() => new Error('username already exists'));
                        }
                        return this.userService.updateUser(user);
                    })
                );
            }),
            catchError((err) => {
                console.error('Error updating user:', err);
                return throwError(() => err);
            })
        );
    }

    assignRole(userId: number, rolesIds: number[]): Observable<User> {
        if (!userId || userId <= 0) {
            return throwError(() => new Error('Invalid user Id'));
        }
        return this.userService.assignRole(userId, rolesIds);
    }

    getRolesByUser(userId: number): Observable<Role[]> {
        if (!userId || userId <= 0) {
            return throwError(() => new Error('Invalid user Id'));
        }

        return this.userService.getRolesByUser(userId).pipe(
            tap({
                next: () => this._error = null,
                error: (err) => {
                    this._error = 'Failed to fetch roles by user';
                    console.error('Error fetching roles for user:', err);
                }
            }),
            catchError(() => of([]))
        );
    }
}