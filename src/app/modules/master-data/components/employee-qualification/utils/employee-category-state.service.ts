import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { EmployeeCategory } from '../../../../../Entities/employee-category ';

@Injectable({ providedIn: 'root' })
export class EmployeeCategoryStateService {
    private readonly editEmployeeCategorySource = new BehaviorSubject<EmployeeCategory | null>(null);
    currentEmployeeCategory$ = this.editEmployeeCategorySource.asObservable();

    setPEmployeeCategoryToEdit(employeeCategory: EmployeeCategory | null): void {
        this.editEmployeeCategorySource.next(employeeCategory)
    }

    clearProjectStatus(): void {
        this.editEmployeeCategorySource.next(null);
    }
}