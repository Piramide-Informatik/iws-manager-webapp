import { inject, Injectable } from '@angular/core';
import { catchError, Observable, switchMap, take, throwError } from 'rxjs';
import { FrameworkAgreementService } from '../../../Services/framework-agreenent.service';
import { BasicContract } from '../../../Entities/basicContract';
import { OrderUtils } from '../../orders/utils/order-utils';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../shared/utils/occ-error';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for framework-agreement-related business logic and operations.
 * Works with FrameworkAgreementService's reactive signals while providing additional functionality.
 */
export class FrameworkAgreementsUtils {
  private readonly frameworkAgreementService = inject(FrameworkAgreementService);
  private readonly orderUtils = inject(OrderUtils);
  /**
  * Gets all framework agreements without any transformation
  * @returns Observable emitting the raw list of framework agreements
  */
  getAllFrameworkAgreements(): Observable<BasicContract[]> {
    return this.frameworkAgreementService.getAllFrameworkAgreements().pipe(
      catchError(() => throwError(() => new Error('Failed to load framework Agreements')))
    );
  }

  /**
  * Gets a framework agreement by ID with proper error handling
  * @param id - ID of the framework agreement to retrieve
  * @returns Observable emitting the framework agreement or undefined if not found
  */
  getFrameworkAgreementById(id: number): Observable<BasicContract | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid framework agreement ID'));
    }

    return this.frameworkAgreementService.getFrameworkAgreementById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load framework agreement'));
      })
    );
  }

  /**
  * Gets all framework agreements given a customer
  * @param customerId - Customer to get his framework agreements
  * @returns Observable emitting the raw list of framework agreemetns
  */
  getAllFrameworkAgreementsByCustomerId(customerId: number): Observable<BasicContract[]> {
    return this.frameworkAgreementService.getAllFrameworkAgreementsByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load framework agreements')))
    );
  }

  /**
  * Gets all framework agreements given a customer sorted by contractNo
  * @param customerId - Customer to get his framework agreements sorted
  * @returns Observable emitting the raw list of framework agreemetns sorted
  */
  getAllFrameworkAgreementsByCustomerIdSortedByContractNo(customerId: number): Observable<BasicContract[]> {
    return this.frameworkAgreementService.getAllFrameworkAgreementsByCustomerIdSortedByContractNo(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load framework agreements sorted')))
    );
  }

  /**
   * Retrieves the next contract number
   * @returns Observable with the next contract number
   * @throws Error when server request fails
   */
  getNextContractNumber(): Observable<number> {
    return this.frameworkAgreementService.getNextContractNumber().pipe(
      catchError(() => throwError(() => new Error('Failed to get contract number')))
    )
  }

  /**
  * Creates a new framework agreement with validation
  * @param frameworkAgreement - Framework Agreement object to create (without id)
  * @returns Observable that completes when framework agreement is created
  */
  createNewFrameworkAgreement(frameworkAgreement: Omit<BasicContract, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<BasicContract> {
    return this.frameworkAgreementService.addFrameworkAgreement(frameworkAgreement);
  }

  /**
  * Deletes a framework agreement by ID and updates the internal framework agreements signal.
  * @param id - ID of the framework agreement to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteFrameworkAgreement(id: number): Observable<void> {
    return this.frameworkAgreementService.deleteFrameworkAgreements(id);
  }

  /**
  * Updates a framework agreement by ID and updates the internal framework agreements signal.
  * @param frameworkAgreement - FrameworkAgreements object with updated data
  * @returns Observable that completes when the update is done
  */
  updateFrameworkAgreements(frameworkAgreement: BasicContract): Observable<BasicContract> {
    if (!frameworkAgreement.id) {
      return throwError(() => new Error('Invalid framework Agreement data'));
    }

    return this.frameworkAgreementService.getFrameworkAgreementById(frameworkAgreement.id).pipe(
      take(1),
      switchMap((currentFrameworkAgreements) => {
        if (!currentFrameworkAgreements) {
          return throwError(() => createNotFoundUpdateError('Basic Contract'));
        }

        if (currentFrameworkAgreements.version !== frameworkAgreement.version) {
          return throwError(() => createUpdateConflictError('Basic Contract'));
        }

        return this.frameworkAgreementService.updateFrameworkAgreements(frameworkAgreement);
      })
    );
  }
}