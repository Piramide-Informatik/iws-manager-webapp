import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, switchMap, take, throwError } from 'rxjs';
import { SubcontractService } from '../../../Services/subcontracts.service';
import { Subcontract } from '../../../Entities/subcontract';
import { SubcontractYearUtils } from './subcontract-year-utils';
import { SubcontractProjectUtils } from './subcontract-project.utils';
import { SubcontractProject } from '../../../Entities/subcontract-project';
import { SubcontractYear } from '../../../Entities/subcontract-year';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for subcontracts-related business logic and operations.
 * Works with SubcontractService's reactive signals while providing additional functionality.
 */
export class SubcontractUtils {
  private readonly subcontractService = inject(SubcontractService);
  private readonly subcontractYearUtils = inject(SubcontractYearUtils);
  private readonly subcontractProjectUtils = inject(SubcontractProjectUtils);
  /**
  * Gets all subcontracts without any transformation
  * @returns Observable emitting the raw list of subcontracts
  */
  getAllSubcontracts(): Observable<Subcontract[]> {
    return this.subcontractService.getAllSubcontracts().pipe(
      catchError(() => throwError(() => new Error('Failed to load subcontracts')))
    );
  }

  /**
  * Gets a subcontract by ID with proper error handling
  * @param id - ID of the subcontract to retrieve
  * @returns Observable emitting the subcontract or undefined if not found
  */
  getSubcontractById(id: number): Observable<Subcontract | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid subcontract ID'));
    }

    return this.subcontractService.getSubcontractById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load subcontract'));
      })
    );
  }

  /**
  * Gets all subcontracts given a customer
  * @param customerId - Customer to get his subcontracts
  * @returns Observable emitting the raw list of subcontracts
  */
  getAllSubcontractsByCustomerId(customerId: number): Observable<Subcontract[]> {
    return this.subcontractService.getAllSubcontractsByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load subcontracts')))
    );
  }

  /**
  * Creates a new subcontract with validation
  * @param subcontract - Subcontract object to create (without id)
  * @returns Observable that completes when subcontract is created
  */
  createNewSubcontract(subcontract: Omit<Subcontract, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Subcontract> {
    return this.subcontractService.addSubcontract(subcontract);
  }

  /**
  * Checks if a subcontract exists by subcontract.id (case-insensitive comparison)
  * @param subcontract.id - Subcontract number to check
  * @returns Observable emitting boolean indicating existence
  */
  subcontractExists(subcontractId: number | string): Observable<boolean> {
    return this.subcontractService.getAllSubcontracts().pipe(
      map(subcontracts => subcontracts.some(
          e => e.id !== null && e.id?.toString().toLowerCase() === subcontractId.toString().toLowerCase()
      )),
      catchError(() => {
          return throwError(() => new Error('Failed to check subcontract existence'));
      })
    );
  }

  /**
   * Refreshes subcontracts data
   * @returns Observable that completes when refresh is done
   */
  refreshSubcontracts(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.subcontractService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
  * Deletes a subcontract by ID and updates the internal subcontracts signal.
  * @param id - ID of the subcontract to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteSubcontract(id: number): Observable<void> {
    return this.subcontractProjectUtils.getAllSubcontractsProject(id).pipe(
      take(1),
      switchMap((subcontractProjectList: SubcontractProject[]) => {
        if(subcontractProjectList.length > 0){
          return throwError(() => new Error('Cannot be deleted because have associated subcontract projects'));
        }
        return this.subcontractYearUtils.getAllSubcontractsYear(id);
      }),
      take(1),
      switchMap((subcontractYearList: SubcontractYear[]) => {
        if(subcontractYearList.length > 0){
          return throwError(() => new Error('Cannot be deleted because have associated subcontract years'));
        }
        return this.subcontractService.deleteSubcontract(id);
      }),
      catchError(err => throwError(() => new Error(err.message || 'Error deleting subcontract')))
    );
  }

  /**
  * Updates a subcontract by ID and updates the internal subcontracts signal.
  * @param subcontract - Subcontract object with updated data
  * @returns Observable that completes when the update is done
  */
  updateSubcontract(subcontract: Subcontract): Observable<Subcontract> {
    if (!subcontract.id) {
      return throwError(() => new Error('Invalid subcontract data'));
    }

    return this.subcontractService.getSubcontractById(subcontract.id).pipe(
      take(1),
      switchMap((currentSubcontract) => {
        if (!currentSubcontract) {
          return throwError(() => new Error('Subcontract not found'));
        }

        if (currentSubcontract.version !== subcontract.version) {
          return throwError(() => new Error('Conflict detected: subcontract version mismatch'));
        }

        return this.subcontractService.updateSubcontract(subcontract);
      })
    );
  }

  /**
  * Updates a subcontract by ID and updates the internal subcontracts signal and subcontract projects.
  * @param subcontract - Subcontract object with updated data
  * @returns Observable that completes when the update is done
  */
  updateSubcontractWithSubcontractProjects(subcontract: Subcontract): Observable<Subcontract> {
    if (!subcontract.id) {
      return throwError(() => new Error('Invalid subcontract data'));
    }

    return this.subcontractService.getSubcontractById(subcontract.id).pipe(
      take(1),
      switchMap((currentSubcontract) => {
        if (!currentSubcontract) {
          return throwError(() => new Error('Subcontract not found'));
        }

        if (currentSubcontract.version !== subcontract.version) {
          return throwError(() => new Error('Conflict detected: subcontract version mismatch'));
        }

        return this.subcontractService.updateSubcontractWithSubcontractProjects(subcontract);
      })
    );
  }
}