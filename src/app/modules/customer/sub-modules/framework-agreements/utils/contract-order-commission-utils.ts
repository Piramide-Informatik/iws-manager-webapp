import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap } from 'rxjs';
import { ContractOrderCommission } from '../../../../../Entities/contractOrderCommission';
import { ContractOrderCommissionService } from '../../../../../Services/contract-order-commission.service';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

/**
 * Utility class for contractOrderCommission-related business logic and operations.
 * Works with ContractOrderCommissionService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class ContractOrderCommissionUtils {
  private readonly contractOrderCommissionService = inject(ContractOrderCommissionService);

  loadInitialData(): Observable<ContractOrderCommission[]> {
    return this.contractOrderCommissionService.loadInitialData();
  }

  /**
   * Gets a contract order commission by ID with proper error handling
   * @param id - ID of the contract order commission to retrieve
   * @returns Observable emitting the contract order commission or undefined if not found
   */
  getContractOrderCommissionById(id: number): Observable<ContractOrderCommission | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid contract order commission ID'));
    }

    return this.contractOrderCommissionService.getContractOrderCommissionById(id).pipe(
      catchError(err => {
        console.error('Error fetching contract order commission:', err);
        return throwError(() => new Error('Failed to load contract order commission'));
      })
    );
  }

  /**
   * Gets all contract order commissions
   * @returns Observable emitting sorted array of contract order commissions
   */
  getAllContractOrderCommissions(): Observable<ContractOrderCommission[]> {
    return this.contractOrderCommissionService.getAllContractOrderCommissions();
  }

  /**
   * Gets all contract order commissions by Basic Contract ID
   * @param basicContractId - ID of the basic contract
   * @returns Observable emitting array of contract order commissions associated with the given basic contract ID
   */
  getContractOrderCommissionsByBasicContractId(basicContractId: number): Observable<ContractOrderCommission[]> {
    return this.contractOrderCommissionService.getContractOrderCommissionsByBasicContractId(basicContractId);
  }

  /**
   * Gets all contract order commissions by basic contract ID sorted by fromOrderValue
   * @param basicContractId - ID of the basic contract
   * @returns Observable emitting array of contract order commissions associated with the given basic contract ID, sorted by fromOrderValue
   */
  getContractOrderCommissionsByBasicContractIdSortedByFromOrderValue(basicContractId: number): Observable<ContractOrderCommission[]> {
    return this.contractOrderCommissionService.getContractOrderCommissionsByBasicContractIdSortedByFromOrderValue(basicContractId);
  }

  /**
   * Creates a new contract order commission with validation
   * @param nameContractOrderCommission - Name for the new contract order commission
   * @returns Observable that completes when contract order commission is created
   */
  addContractOrderCommission(contractOrderCommission: Omit<ContractOrderCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ContractOrderCommission> {
    return this.contractOrderCommissionService.addContractOrderCommission(contractOrderCommission);
  }

  /**
   * Refreshes customers data
   * @returns Observable that completes when refresh is done
  */
  refreshContractOrderCommissions(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.contractOrderCommissionService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a contract order commission by ID and updates the internal contract order commissions signal.
 * @param id - ID of the contract order commission to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteContractOrderCommission(id: number): Observable<void> {
    return this.contractOrderCommissionService.deleteContractOrderCommission(id).pipe(
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
 * Updates a contract order commission by ID and updates the internal contractOrderCommissions signal.
 * @param id - ID of the contract order commission to update
 * @returns Observable that completes when the update is done
 */
  updateContractOrderCommission(contractOrderCommission: ContractOrderCommission): Observable<ContractOrderCommission> {
    if (!contractOrderCommission?.id) {
      return throwError(() => new Error('Invalid contract order commission data'));
    }

    return this.contractOrderCommissionService.getContractOrderCommissionById(contractOrderCommission.id).pipe(
      take(1),
      switchMap((currentContractOrderCommission) => {
        if (!currentContractOrderCommission) {
          return throwError(() => createNotFoundUpdateError('Contract Order Commission'));
        }

        if (currentContractOrderCommission.version !== contractOrderCommission.version) {
          return throwError(() => createUpdateConflictError('Contract Order Commission'));
        }

        return this.contractOrderCommissionService.updateContractOrderCommission(contractOrderCommission);
      })
    );
  }
}