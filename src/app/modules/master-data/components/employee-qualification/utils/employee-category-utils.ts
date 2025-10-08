import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  map,
  take,
  throwError,
  switchMap,
  of,
} from 'rxjs';
import { EmployeeCategoryService } from '../../../../../Services/employee-category.service';
import { EmployeeCategory } from '../../../../../Entities/employee-category ';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

@Injectable({ providedIn: 'root' })
export class EmployeeCategoryUtils {
  private readonly employeeCategoryService = inject(EmployeeCategoryService);

  loadInitialData(): Observable<EmployeeCategory[]> {
    return this.employeeCategoryService.loadInitialData();
  }

  addEmployeeCategory(
    employeeCategory: Omit<EmployeeCategory, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Observable<EmployeeCategory> {
    const trimmedTitle = employeeCategory.title?.trim();
    if (!trimmedTitle) {
      return throwError(
        () => new Error('EmployeeCategory name cannot be empty')
      );
    }

    return this.employeeCategoryExists(trimmedTitle).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(
            () => new Error('PROJECT_STATUS.ERROR.ALREADY_EXISTS')
          );
        }

        return this.employeeCategoryService.addEmployeeCategory(employeeCategory);
      }),
      catchError((err) => {
        if (
          err.message === 'PROJECT_STATUS.ERROR.ALREADY_EXISTS' ||
          err.message === 'PROJECT_STATUS.ERROR.EMPTY'
        ) {
          return throwError(() => err);
        }

        console.error('Error creating title:', err);
        return throwError(
          () => new Error('PROJECT_STATUS.ERROR.CREATION_FAILED')
        );
      })
    );
  }

  //Check if a employeeCategory exists
  employeeCategoryExists(title: string): Observable<boolean> {
    return this.employeeCategoryService.getAllEmployeeCategories().pipe(
      map((employeeCategories) =>
        employeeCategories.some(
          (t) => t.title.toLowerCase() === title.toLowerCase()
        )
      ),
      catchError((err) => {
        console.error('Error checking projectStatus existence:', err);
        return throwError(
          () => new Error('Failed to check projectStatus existence')
        );
      })
    );
  }
  //Get a employeeCategory by ID
  getEmployeeCategoryById(
    id: number
  ): Observable<EmployeeCategory | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid employeeCategory ID'));
    }

    return this.employeeCategoryService.getEmployeeCategoryById(id).pipe(
      catchError((err) => {
        console.error('Error fetching employeeCategory:', err);
        return throwError(() => new Error('Failed to load employeeCategory'));
      })
    );
  }

  getEmployeeCategories(): Observable<EmployeeCategory[]> {
    return this.employeeCategoryService.getAllEmployeeCategories().pipe(
      catchError((err) => {
        console.error('Error fetching employeeCategories:', err);
        return throwError(() => new Error('Failed to load employeeCategories'));
      })
    );
  }

  //Refreshes EmployeeCategories data
  refreshEmployeeCategories(): Observable<void> {
    return new Observable<void>((subscriber) => {
      this.employeeCategoryService.refreshEmployeeCategories();
      subscriber.next();
      subscriber.complete();
    });
  }

  //Deletes a EmployeeCategory by ID
  deleteEmployeeCategory(id: number): Observable<void> {
    return this.checkEmployeeCategoryUsage(id).pipe(
      switchMap((isUsed) => {
        if (isUsed) {
          return throwError(
            () =>
              new Error(
                'Cannot delete register: it is in use by other entities'
              )
          );
        }
        return this.employeeCategoryService.deleteEmployeeCategory(id);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  //Checks if a EmployeeCategory is used by any entity
  private checkEmployeeCategoryUsage(
    idEmployeeCategory: number
  ): Observable<boolean> {
    // For now, no use has been verified in any entity.
    return of(false);
  }

  //Update a EmployeeCategory by ID and updates the internal EmployeeCategory signal
  updateEmployeeCategory(employeeCategory: EmployeeCategory): Observable<EmployeeCategory> {
    if (!employeeCategory?.id) {
      return throwError(() => new Error('Invalid employeeCategory data'));
    }
    return this.employeeCategoryService
      .getEmployeeCategoryById(employeeCategory.id)
      .pipe(
        take(1),
        switchMap((currentProjectStatus) => {
          if (!currentProjectStatus) {
            return throwError(() => createNotFoundUpdateError('Employee Category'));
          }
          if (currentProjectStatus.version !== employeeCategory.version) {
            return throwError(() => createUpdateConflictError('Employee Category'));

          }
          return this.employeeCategoryService.updateEmployeeCategory(employeeCategory);
        }),
        catchError((err) => {
          console.error('Error updating employeeCategory:', err);
          return throwError(() => err);
        })
      );
  }
}
