import { EnvironmentInjector, Injectable, inject, runInInjectionContext } from '@angular/core';
import { Observable, catchError, filter, map, switchMap, take, throwError } from 'rxjs';
import { CompanyType } from '../../../../../Entities/companyType';
import { CompanyTypeService } from '../../../../../Services/company-type.service';
import { toObservable } from '@angular/core/rxjs-interop';

/**
 * Utility class for company-type-related business logic and operations.
 * Works with companyTypeService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class CompanyTypeUtils {
  private readonly companyTypeService = inject(CompanyTypeService);
  private readonly injector = inject(EnvironmentInjector);

  /**
     * Gets a company type by ID with proper error handling
     * @param id - ID of the company type to retrieve
     * @returns Observable emitting the company type or undefined if not found
     */
  getCompanyTypeById(id: number): Observable<CompanyType | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid company type ID'));
    }

    return this.companyTypeService.getCompanyTypeById(id).pipe(
      catchError(err => {
        console.error('Error fetching company type:', err);
        return throwError(() => new Error('Failed to load company type'));
      })
    );
  }

  /**
   * Creates a new company type with validation
   * @param nameCompanyType - Name for the new compnay type
   * @returns Observable that completes when company type is created
   */
  createNewCompanyType(nameCompanyType: string): Observable<void> {

    return new Observable<void>(subscriber => {
      this.companyTypeService.addCompanyType({
        name: nameCompanyType
      });

      // Complete the observable after operation
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Checks if a company type exists (case-insensitive comparison)
   * @param name - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  companyTypeExists(name: string): Observable<boolean> {
    return this.companyTypeService.getAllCompanyTypes().pipe(
      map(companyType => companyType.some(
        ct => ct.name.toLowerCase() === name.toLowerCase()
      )),
      catchError(err => {
        console.error('Error checking compnay type existence:', err);
        return throwError(() => new Error('Failed to check company type existence'));
      })
    );
  }

  /**
   * Gets all types of companies sorted alphabetically by first name
   * @returns Observable emitting sorted array of types of companies
   */
  getCompanyTypeSortedByName(): Observable<CompanyType[]> {
    return this.companyTypeService.getAllCompanyTypes().pipe(
      map(companyTypes => [...companyTypes].sort((a, b) => a.name.localeCompare(b.name))),
      catchError(err => {
        console.error('Error sorting company types:', err);
        return throwError(() => new Error('Failed to sort company types'));
      })
    );
  }

  /**
 * Deletes a company type by ID and updates the internal titles signal.
 * @param id - ID of the company type to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteCompanyType(id: number): Observable<void> {
    return new Observable(observer => {
      this.companyTypeService.deleteCompanyType(id);

      setTimeout(() => {
        if (!this.companyTypeService.error()) {
          observer.next();
          observer.complete();
        } else {
          observer.error(this.companyTypeService.error());
        }
      }, 100);
    });
  }

  /**
 * Updates a company type by ID and updates the internal titles signal.
 * @param id - ID of the company type to update
 * @returns Observable that completes when the update is done
 */
  updateCompanyType(companyType: CompanyType): Observable<CompanyType> {
    if (!companyType?.id) {
      return throwError(() => new Error('Invalid company type data'));
    }

    return this.companyTypeService.getCompanyTypeById(companyType.id).pipe(
      take(1),
      switchMap((currentCompanyType) => {
        if (!currentCompanyType) {
          return throwError(() => new Error('Company type not found'));
        }

        if (currentCompanyType.version !== companyType.version) {
          return throwError(() => new Error('Conflict detected: company type version mismatch'));
        }

        return this.companyTypeService.updateCompanyType(companyType);
      })
    );
  }

  private waitForUpdatedCompanyType(id: number, observer: any) {
    return toObservable(this.companyTypeService.companyTypes).pipe(
      map(companyTypes => companyTypes.find(ct => ct.id === id)),
      filter(updated => !!updated),
      take(1)
    ).subscribe({
      next: (updatedCompanyType) => {
        observer.next(updatedCompanyType);
        observer.complete();
      },
      error: (err) => observer.error(err)
    });
  }

  private listenForUpdateErrors(observer: any) {
    return toObservable(this.companyTypeService.error).pipe(
      filter(error => !!error),
      take(1)
    ).subscribe({
      next: (err) => observer.error(err)
    });
  }
}