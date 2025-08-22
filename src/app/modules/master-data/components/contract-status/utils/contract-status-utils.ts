import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, forkJoin, of } from 'rxjs';
import { OrderUtils } from '../../../../orders/utils/order-utils';
import { FrameworkAgreementsUtils } from '../../../../framework-agreements/utils/framework-agreement.util';
import { ContractStatus } from '../../../../../Entities/contractStatus';
import { ContractStatusService } from '../../../../../Services/contract-status.service';

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

  getAllcontractStatuses(): Observable<ContractStatus[]> {
    return this.contractStatusService.getAllContractStatuses();
  }

  /**
     * Refreshes customers data
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
    return this.checkContractStatusUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.contractStatusService.deleteContractStatus(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a contractStatus is used by any order or framework agreement (basic contract).
   * @param idContractStatus - ID of the contractStatus to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkContractStatusUsage(idContractStatus: number): Observable<boolean> {
    return forkJoin([
      this.orderUtils.getAllOrders().pipe(
        map(orders => orders.some(order => order.contractStatus?.id === idContractStatus)),
        catchError(() => of(false))
      ),
      this.frameworkUtils.getAllFrameworkAgreements().pipe(
        map(frameworks => frameworks.some(framework => framework.contractStatus?.id === idContractStatus)),
        catchError(() => of(false))
      )
    ] as const).pipe(
      map(([usedInOrders, usedInFrameworks]) => usedInOrders || usedInFrameworks)
    );
  }

  /**
 * Updates a contractStatus by ID and updates the internal contractStatuses signal.
 * @param id - ID of the contractStatus to update
 * @returns Observable that completes when the update is done
 */
  updateContractStatus(contractStatus: ContractStatus): Observable<ContractStatus> {
    if (!contractStatus?.id) {
      return throwError(() => new Error('Invalid contractStatus data'));
    }

    return this.contractStatusService.getContractStatusById(contractStatus.id).pipe(
      take(1),
      map((currentContractStatus) => {
        if (!currentContractStatus) {
          throw new Error('ContractStatus not found');
        }
        if (currentContractStatus.version !== contractStatus.version) {
          throw new Error('Version conflict: ContractStatus has been updated by another user');
        }
        return contractStatus;
      }),
      switchMap((validatedContractStatus: ContractStatus) => this.contractStatusService.updateContractStatus(validatedContractStatus)),
      catchError((err) => {
        console.error('Error updating contractStatus:', err);
        return throwError(() => err);
      })
    );
  }
}