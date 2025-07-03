import { inject, Injectable } from '@angular/core';
import { EmployeeService } from '../../../Services/employee.service';
import { catchError, map, Observable, switchMap, take, throwError } from 'rxjs';
import { Employee } from '../../../Entities/employee';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for employee-related business logic and operations.
 * Works with EmployeerService's reactive signals while providing additional functionality.
 */
export class EmployeeUtils {
  private readonly employeeService = inject(EmployeeService);

  /**
  * Gets all employees without any transformation
  * @returns Observable emitting the raw list of employees
  */
  getAllEmployees(): Observable<Employee[]> {
    return this.employeeService.getAllEmployees().pipe(
      catchError(() => throwError(() => new Error('Failed to load employees')))
    );
  }

  /**
  * Gets a employee by ID with proper error handling
  * @param id - ID of the employee to retrieve
  * @returns Observable emitting the employee or undefined if not found
  */
  getEmployeeById(id: number): Observable<Employee | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid employee ID'));
    }

    return this.employeeService.getEmployeeById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load employee'));
      })
    );
  }

  /**
  * Gets all employees given a customer
  * @param customerId - Customer to get his employees
  * @returns Observable emitting the raw list of employees
  */
  getAllEmployeesByCustomerId(customerId: number): Observable<Employee[]> {
    return this.employeeService.getAllEmployeesByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load employees')))
    );
  }

  /**
  * Creates a new employee with validation
  * @param employee - Employee object to create (without id)
  * @returns Observable that completes when employee is created
  */
  createNewEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Employee> {
    return this.employeeService.addEmployee(employee);
  }

  /**
  * Checks if a employee exists by employee.id (case-insensitive comparison)
  * @param employee.id - Employee number to check
  * @returns Observable emitting boolean indicating existence
  */
  employeeExists(employeeId: number | string): Observable<boolean> {
    return this.employeeService.getAllEmployees().pipe(
      map(employees => employees.some(
          e => e.id !== null && e.id?.toString().toLowerCase() === employeeId.toString().toLowerCase()
      )),
      catchError(() => {
          return throwError(() => new Error('Failed to check employee existence'));
      })
    );
  }

  /**
  * Gets all employees sorted alphabetically by firstName
  * @returns Observable emitting sorted array of employees
  */
  getEmployeesSortedByName(): Observable<Employee[]> {
    return this.employeeService.getAllEmployees().pipe(
      map((employees: Employee[]) => {
        if (!Array.isArray(employees)) {
          return [];
        }
        // Filtra los empleados con nombre válido y ordena alfabéticamente
        return employees
        .filter(employee => !!employee.firstname && employee.firstname.trim() !== '')
        .sort((a, b) => (a.firstname ?? '').localeCompare(b.firstname ?? ''));
      }),
      catchError(() => throwError(() => new Error('Failed to sort employees')))
    );
  }

  /**
   * Refreshes employees data
   * @returns Observable that completes when refresh is done
   */
  refreshEmployees(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.employeeService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
  * Deletes a employee by ID and updates the internal employees signal.
  * @param id - ID of the employee to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteEmployee(id: number): Observable<void> {
    return this.employeeService.deleteEmployee(id);
  }

  /**
  * Updates a employee by ID and updates the internal employees signal.
  * @param employee - Employee object with updated data
  * @returns Observable that completes when the update is done
  */
  updateEmployee(employee: Employee): Observable<Employee> {
    if (!employee.id) {
      return throwError(() => new Error('Invalid employee data'));
    }

    return this.employeeService.getEmployeeById(employee.id).pipe(
      take(1),
      switchMap((currentEmployee) => {
        if (!currentEmployee) {
          return throwError(() => new Error('Employee not found'));
        }

        if (currentEmployee.version !== employee.version) {
          return throwError(() => new Error('Conflict detected: employee person version mismatch'));
        }

        return this.employeeService.updateEmployee(employee);
      })
    );
  }
}