import { Injectable, inject } from "@angular/core";
import { Observable, catchError, map, take, throwError, switchMap, forkJoin, of} from "rxjs";
import { User } from "../../../../../Entities/user";
import { RoleUtils } from "../../roles/utils/role-utils";
import { UserService } from "../../../../../Services/user.service";

@Injectable({
    providedIn: 'root'
})
export class UserUtils {
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

    addUser(
        username: string,
        firstName: string,
        lastName: string,
        password: string,
        email: string
    ): Observable<User> {
        // Sanitizar todos los inputs
        const trimmedUsername = username?.trim();
        const trimmedFirstName = firstName?.trim();
        const trimmedLastName = lastName?.trim();
        const trimmedPassword = password?.trim();
        const trimmedEmail = email?.trim().toLowerCase();
    
        // Validar campos requeridos
        if (!trimmedUsername) {
            return throwError(() => new Error('TITLE.ERROR.EMPTY_USERNAME'));
        }

        if (!trimmedFirstName) {
            return throwError(() => new Error('TITLE.ERROR.EMPTY_FIRSTNAME'));
        }

        if (!trimmedLastName) {
            return throwError(() => new Error('TITLE.ERROR.EMPTY_LASTNAME'));
        }

        if (!trimmedPassword) {
            return throwError(() => new Error('TITLE.ERROR.EMPTY_PASSWORD'));
        }

        if (!trimmedEmail) {
            return throwError(() => new Error('TITLE.ERROR.EMPTY_EMAIL'));
        }

        // Validar formato de email (opcional)
        if (!this.isValidEmail(trimmedEmail)) {
            return throwError(() => new Error('TITLE.ERROR.INVALID_EMAIL'));
        }
    
        return this.userExists(trimmedUsername).pipe(
            switchMap(exists => {
            if (exists) {
                return throwError(() => new Error('TITLE.ERROR.ALREADY_EXISTS'));
            }

            return this.userService.addUser({
                username: trimmedUsername,
                firstName: trimmedFirstName,
                lastName: trimmedLastName,
                password: trimmedPassword,
                email: trimmedEmail
            });
            }),
            catchError(err => {
            if (err.message.startsWith('TITLE.ERROR.')) {
                return throwError(() => err);
            }

            console.error('Error creating user:', err);
            return throwError(() => new Error('TITLE.ERROR.CREATION_FAILED'));
            })
        );
    }

    private isValidEmail(email: string): boolean {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    userExists(username: string): Observable<boolean> {
    return this.userService.getAllUser().pipe(
        map(users => users.some(
            t => t.username.toLowerCase() === username.toLowerCase()
        )),
        catchError(err => {
        console.error('Error checking title existence:', err);
        return throwError(() => new Error('Failed to check title existence'));
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
        return this.checkUserUsage(id).pipe(
            switchMap(isUsed => {
                console.log(isUsed)
                if (isUsed) {
                return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
                }
                return this.userService.deleteUser(id);
            }),
        catchError(error => {
            return throwError(() => error);
        })
        );
    }
    private checkUserUsage(idUser: number): Observable<boolean> {
        return of(false);
    }

    updateUsers(user: User): Observable<User> {
        if (!user?.id) {
            return throwError(() => new Error('Invalid title data'));
        }
    
        return this.userService.getUserById(user.id).pipe(
            take(1),
            map((currentUser) => {
                if (!currentUser) {
                throw new Error('User not found');
                }
                if (currentUser.version !== user.version) {
                    throw new Error('Version conflict: User has been updated by another user');
                }
                return user;
            }),
            switchMap((validatedUser: User) => this.userService.updateUser(validatedUser)),
            catchError((err) => {
            console.error('Error updating user:', err);
            return throwError(() => err);
            })
        );
    }
}