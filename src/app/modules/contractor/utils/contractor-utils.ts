import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable, switchMap, take, throwError } from 'rxjs';
import { ContractorService } from '../../../Services/contractor.service';
import { Contractor } from '../../../Entities/contractor';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for contractor-related business logic and operations.
 * Works with ContractorService's reactive signals while providing additional functionality.
 */
export class ContractorUtils {
  private readonly contractorService = inject(ContractorService);

  /**
  * Gets all contractors without any transformation
  * @returns Observable emitting the raw list of contractors
  */
  getAllContractors(): Observable<Contractor[]> {
    return this.contractorService.getAllContractors().pipe(
      catchError(() => throwError(() => new Error('Failed to load contractors')))
    );
  }

  /**
  * Gets a contractor by ID with proper error handling
  * @param id - ID of the contractor to retrieve
  * @returns Observable emitting the contractor or undefined if not found
  */
  getContractorById(id: number): Observable<Contractor | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid contractor ID'));
    }

    return this.contractorService.getContractorById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load contractor'));
      })
    );
  }

  /**
  * Gets all contractors given a customer
  * @param customerId - Customer to get his contractors
  * @returns Observable emitting the raw list of contractors
  */
  getAllContractorsByCustomerId(customerId: number): Observable<Contractor[]> {
    return this.contractorService.getAllContractorsByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load contractors')))
    );
  }

  /**
  * Creates a new contractor with validation
  * @param contractor - Contractor object to create (without id)
  * @returns Observable that completes when contractor is created
  */
  createNewContractor(contractor: Omit<Contractor, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Contractor> {
    return this.contractorService.addContractor(contractor);
  }

  /**
  * Checks if a contractor exists by contractor.id (case-insensitive comparison)
  * @param contractor.id - Contractor number to check
  * @returns Observable emitting boolean indicating existence
  */
  contractorExists(contractorId: number | string): Observable<boolean> {
    return this.contractorService.getAllContractors().pipe(
      map(contractors => contractors.some(
          c => c.id !== null && c.id?.toString().toLowerCase() === contractorId.toString().toLowerCase()
      )),
      catchError(() => {
          return throwError(() => new Error('Failed to check contractor existence'));
      })
    );
  }

  /**
   * Refreshes contractors data
   * @returns Observable that completes when refresh is done
   */
  refreshContractors(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.contractorService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
  * Deletes a contractor by ID and updates the internal contractors signal.
  * @param id - ID of the contractor to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteContractor(id: number): Observable<void> {
    return this.contractorService.deleteContractor(id);
  }

  /**
  * Updates a contractor by ID and updates the internal contractors signal.
  * @param contractor - Contractor object with updated data
  * @returns Observable that completes when the update is done
  */
  updateContractor(contractor: Contractor): Observable<Contractor> {
    if (!contractor.id) {
      return throwError(() => new Error('Invalid contractor data'));
    }

    return this.contractorService.getContractorById(contractor.id).pipe(
      take(1),
      switchMap((currentContractor) => {
        if (!currentContractor) {
          return throwError(() => new Error('Contractor not found'));
        }

        if (currentContractor.version !== contractor.version) {
          return throwError(() => new Error('Conflict detected: contractor version mismatch'));
        }

        return this.contractorService.updateContractor(contractor);
      })
    );
  }
}