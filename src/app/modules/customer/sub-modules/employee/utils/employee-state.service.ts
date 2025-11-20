import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Employee } from '../../../../../Entities/employee';

@Injectable({ providedIn: 'root' })
export class EmployeeStateService {
  private readonly editEmployeeSource = new BehaviorSubject<Employee | null>(null);
  currentEmployee$ = this.editEmployeeSource.asObservable();

  setEmployeeToEdit(employee: Employee | null): void {
    this.editEmployeeSource.next(employee);
  }

  clearEmployee() {
    this.editEmployeeSource.next(null);
  }
}