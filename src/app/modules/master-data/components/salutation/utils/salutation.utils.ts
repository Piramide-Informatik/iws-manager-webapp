import { EnvironmentInjector, Injectable, inject } from '@angular/core';
import { Observable, catchError, filter, forkJoin, map, of, switchMap, take, throwError } from 'rxjs';
import { Salutation } from '../../../../../Entities/salutation';
import { SalutationService } from '../../../../../Services/salutation.service';
import { toObservable } from '@angular/core/rxjs-interop';
import { CustomerUtils } from '../../../../customer/utils/customer-utils';
import { EmployeeUtils } from '../../../../employee/utils/employee.utils';

/**
 * Utility class for salutation-related business logic and operations.
 * Works with SalutationService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' }) 
export class SalutationUtils {
  private readonly salutationService = inject(SalutationService);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly employeeUtils = inject(EmployeeUtils);

  /**
   * Gets a salutation by ID with proper error handling
   * @param id - ID of the salutation to retrieve
   * @returns Observable emitting the salutation or undefined if not found
   */
  getSalutationById(id: number): Observable<Salutation | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid salutation ID'));
    }

    return this.salutationService.getSalutationById(id).pipe(
      catchError(err => {
        console.error('Error fetching salutation:', err);
        return throwError(() => new Error('Failed to load salutation'));
      })
    );
  }

  /**
   * Creates a new salutation with validation
   * @param nameSalutation - Name for the new salutation
   * @returns Observable that completes when salutation is created
   */
  createNewSalutation(nameSalutation: string): Observable<void> {
    if (!nameSalutation?.trim()) {
      return throwError(() => new Error('Salutation name cannot be empty'));
    }

    return new Observable<void>(subscriber => {
      this.salutationService.addSalutation({
        name: nameSalutation.trim(),
      });

      // Complete the observable after operation
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Checks if a salutation exists (case-insensitive comparison)
   * @param name - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  salutationExists(name: string): Observable<boolean> {
    return this.salutationService.getAllSalutations().pipe(
      map(salutations => salutations.some(
        t => t.name.toLowerCase() === name.toLowerCase()
      )),
      catchError(err => {
        console.error('Error checking salutation existence:', err);
        return throwError(() => new Error('Failed to check salutation existence'));
      })
    );
  }

  /**
   * Gets all salutations sorted alphabetically by name
   * @returns Observable emitting sorted array of salutations
   */
  getSalutationsSortedByName(): Observable<Salutation[]> {
    return this.salutationService.getAllSalutations().pipe(
      map(salutations => [...salutations].sort((a, b) => a.name.localeCompare(b.name))),
      catchError(err => {
        console.error('Error sorting salutations:', err);
        return throwError(() => new Error('Failed to sort salutations'));
      })
    );
  }

  /**
   * Refreshes salutations data
   * @returns Observable that completes when refresh is done
   */
  refreshSalutations(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.salutationService.refreshSalutations();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a salutation by ID and updates the internal salutations signal.
 * @param id - ID of the salutation to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteSalutation(id: number): Observable<void> {
    return this.checkSalutationUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.salutationService.deleteSalutation(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a salutation is used by any customer contacts or employees.
   * @param idSalutation - ID of the salutation to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkSalutationUsage(idSalutation: number): Observable<boolean> {
    return forkJoin([
      this.customerUtils.getAllContacts().pipe(
        map(contacts => contacts.some(contact => contact.salutation?.id === idSalutation)),
        catchError(() => of(false))
      ),
      this.employeeUtils.getAllEmployees().pipe(
        map(employees => employees.some(employee => employee.salutation?.id === idSalutation)),
        catchError(() => of(false))
      )
    ]).pipe(
      map(([usedInCustomers, usedInEmployees]) => usedInCustomers || usedInEmployees)
    );
  }

  /**
 * Updates a salutation by ID and updates the internal salutations signal.
 * @param id - ID of the salutation to update
 * @returns Observable that completes when the update is done
 */
  updateSalutation(salutation: Salutation): Observable<Salutation> {
    if (!salutation?.id) {
      return throwError(() => new Error('Invalid salutation data'));
    }

    return this.salutationService.getSalutationById(salutation.id).pipe(
      take(1),
      switchMap((currentSalutation) => {
        if (!currentSalutation) {
          return throwError(() => new Error('Salutation not found'));
        }

        if (currentSalutation.version !== salutation.version) {
          return throwError(() => new Error('Conflict detected: salutation version mismatch'));
        }

        return this.salutationService.updateSalutation(salutation);
      })
    );
  }

  private waitForUpdatedSalutation(id: number, observer: any) {
    return toObservable(this.salutationService.salutations).pipe(
      map(salutations => salutations.find(t => t.id === id)),
      filter(updated => !!updated),
      take(1)
    ).subscribe({
      next: (updatedSalutation) => {
        observer.next(updatedSalutation);
        observer.complete();
      },
      error: (err) => observer.error(err)
    });
  }

  private listenForUpdateErrors(observer: any) {
    return toObservable(this.salutationService.error).pipe(
      filter(error => !!error),
      take(1)
    ).subscribe({
      next: (err) => observer.error(err)
    });
  }
}