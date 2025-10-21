import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap } from 'rxjs';
import { OrderUtils } from '../../../../orders/utils/order-utils';
import { FrameworkAgreementsUtils } from '../../../../framework-agreements/utils/framework-agreement.util';
import { ContractStatus } from '../../../../../Entities/contractStatus';
import { ContractStatusService } from '../../../../../Services/contract-status.service';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for contractStatus-related business logic and operations.
 * Works with ContractStatusService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class ContractStatusUtils {
  private readonly contractStatusService = inject(ContractStatusService);
  private readonly orderUtils = inject(OrderUtils);
  private readonly frameworkUtils = inject(FrameworkAgreementsUtils);

  loadInitialData(): Observable<ContractStatus[]> {
    return this.contractStatusService.loadInitialData();
  }

  /**
   * Gets a contractStatus by ID with proper error handling
   * @param id - ID of the contractStatus to retrieve
   * @returns Observable emitting the contractStatus or undefined if not found
   */
  getContractStatusById(id: number): Observable<ContractStatus | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid contractStatus ID'));
    }

    return this.contractStatusService.getContractStatusById(id).pipe(
      catchError(err => {
        console.error('Error fetching contractStatus:', err);
        return throwError(() => new Error('Failed to load contractStatus'));
      })
    );
  }

  /**
   * Creates a new contractStatus with validation
   * @param nameContractStatus - Name for the new contractStatus
   * @returns Observable that completes when contractStatus is created
   */
  addContractStatus(contractStatus: Omit<ContractStatus, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ContractStatus> {
    return this.contractStatusService.addContractStatus(contractStatus);
  }

  /**
   * Gets all contract statuses
   * @returns Observable emitting all contract statuses
   */
  getAllcontractStatuses(): Observable<ContractStatus[]> {
    return this.contractStatusService.getAllContractStatuses();
  }

  /**
   * Refreshes contract statuses data
   * @returns Observable that completes when refresh is done
   */
  refreshcontractStatuses(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.contractStatusService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Deletes a contractStatus by ID and updates the internal contractStatuses signal.
   * @param id - ID of the contractStatus to delete
   * @returns Observable that completes when the deletion is done
   */
  deleteContractStatus(id: number): Observable<void> {
    return this.contractStatusService.deleteContractStatus(id);
  }

  /**
   * Updates a contractStatus by ID and updates the internal contractStatuses signal.
   * @param contractStatus - ContractStatus entity to update
   * @returns Observable that completes when the update is done
   */
  updateContractStatus(contractStatus: ContractStatus): Observable<ContractStatus> {
    if (!contractStatus?.id) {
      return throwError(() => new Error('Invalid contractStatus data'));
    }

    return this.contractStatusService.getContractStatusById(contractStatus.id).pipe(
      take(1),
      switchMap((currentContractStatus) => {
        if (!currentContractStatus) {
          return throwError(() => createNotFoundUpdateError('Contract status'));
        }
        if (currentContractStatus.version !== contractStatus.version) {
          return throwError(() => createUpdateConflictError('Contract status'));
        }
        return this.contractStatusService.updateContractStatus(contractStatus);
      }),
      catchError((err) => {
        console.error('Error updating contractStatus:', err);
        return throwError(() => err);
      })
    );
  }
}