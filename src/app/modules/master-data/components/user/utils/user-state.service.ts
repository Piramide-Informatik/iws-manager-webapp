import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { User } from '../../../../../Entities/user';

@Injectable({ providedIn: 'root' })
export class UserStateService {
    private readonly editUserSource = new BehaviorSubject<User | null>(null);
    currentUser$ = this.editUserSource.asObservable();

    setUserToEdit(user: User | null): void {
        this.editUserSource.next(user);
    }

    clearUser() {
        this.editUserSource.next(null);
    }
}