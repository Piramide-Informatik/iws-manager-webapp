import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EmployeeIws } from '../../../../../Entities/employeeIws';

@Injectable({ providedIn: 'root' })
export class EmployeeIwsStateService {
    private readonly editEmployeeIwsSource = new BehaviorSubject<EmployeeIws | null>(null);
    currentEmployeeIws$ = this.editEmployeeIwsSource.asObservable();

    setEmployeeIwsToEdit(user: EmployeeIws | null): void {
        this.editEmployeeIwsSource.next(user);
    }

    clearTitle() {
        this.editEmployeeIwsSource.next(null);
    }
}