import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, switchMap, take, throwError } from 'rxjs';
import { CompanyType } from '../../../../../Entities/companyType';
import { CompanyTypeService } from '../../../../../Services/company-type.service';
import { CustomerUtils } from '../../../../customer/utils/customer-utils';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for company-type-related business logic and operations.
 * Works with companyTypeService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class CompanyTypeUtils {
  private readonly companyTypeService = inject(CompanyTypeService);
  private readonly customerUtils = inject(CustomerUtils);

  loadInitialData(): Observable<CompanyType[]> {
    return this.companyTypeService.loadInitialData();
  }

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
   * @param CompanyType - new compnay type without timestamp
   * @returns Observable that completes when company type is created
   */
  createNewCompanyType(companyType: Omit<CompanyType, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<CompanyType> {
    return this.companyTypeService.addCompanyType(companyType);
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
    return this.companyTypeService.deleteCompanyType(id);

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
          return throwError(() => createNotFoundUpdateError('Company Type'));
        }

        if (currentCompanyType.version !== companyType.version) {
          return throwError(() => createUpdateConflictError('Company Type'));
        }

        return this.companyTypeService.updateCompanyType(companyType);
      })
    );
  }
  /**
 * Checks if a company type with the given name already exists
 * @param name - Name of the company type to check
 * @returns Observable emitting true if exists, false otherwise
 */
companyTypeExists(name: string): Observable<boolean> {
  return this.companyTypeService.getAllCompanyTypes().pipe(
    map((companyTypes: CompanyType[]) =>
      companyTypes.some(ct => ct.name.toLowerCase() === name.toLowerCase())
    ),
    catchError(err => {
      console.error('Error checking company type existence:', err);
      return throwError(() => new Error('Failed to check company type existence'));
    })
  );
}
}