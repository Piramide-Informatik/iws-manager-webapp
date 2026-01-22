import { inject, Injectable } from '@angular/core';
import { EmployeeService } from '../../../../../Services/employee.service';
import { catchError, map, Observable, switchMap, take, throwError } from 'rxjs';
import { Employee } from '../../../../../Entities/employee';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';
import { EmployeeFullNameDTO } from '../../../../../Entities/employeeFullNameDTO';

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
  * Gets all employees given a project
  * @param projectId - Project to get his employees
  * @returns Observable emitting the raw list of employees
  */
  getAllEmployeesByProjectId(projectId: number): Observable<Employee[]> {
    return this.employeeService.getAllEmployeesByProjectId(projectId).pipe(
      catchError(() => throwError(() => new Error('Failed to load employees')))
    );
  }

  /**
  * Gets the next available employee number for a specific customer
  * @param customerId - Customer to get the next employee number
  * @returns Observable emitting the next employee number or null if not available
  */
  getNextEmployeeNumber(customerId: number): Observable<number | null> {
    return this.employeeService.getNextEmployeeNumber(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to fetch employee number')))
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
  * Gets all employees with full name sorted alphabetically by firstName
  * @returns Observable emitting sorted array of employees
  */
  getEmployeesWithFullNameSortedByName(customerId: number): Observable<EmployeeFullNameDTO[]> {
    return this.employeeService.getAllEmployeesSortedByFullNameByCustomerId(customerId).pipe(
      map((employees: EmployeeFullNameDTO[]) => {
        if (!Array.isArray(employees)) {
          return [];
        }
        return employees;
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
          return throwError(() => createNotFoundUpdateError('Employee'));
        }

        if (currentEmployee.version !== employee.version) {
          return throwError(() => createUpdateConflictError('Employee'));
        }

        return this.employeeService.updateEmployee(employee);
      })
    );
  }
}