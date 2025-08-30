import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap } from 'rxjs';
import { ContractOrderCommission } from '../../../Entities/contractOrderCommission';
import { ContractOrderCommissionService } from '../../../Services/contract-order-commission.service';

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
   * Creates a new contract order commission with validation
   * @param nameContractOrderCommission - Name for the new contract order commission
   * @returns Observable that completes when contract order commission is created
   */
  addContractOrderCommission(contractOrderCommission: Omit<ContractOrderCommission, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<ContractOrderCommission> {
    return this.contractOrderCommissionService.addContractOrderCommission(contractOrderCommission);
  }

  /**
   * Gets all contract order commissions
   * @returns Observable emitting sorted array of contract order commissions
   */
  getAllContractOrderCommissions(): Observable<ContractOrderCommission[]> {
    return this.contractOrderCommissionService.getAllContractOrderCommissions();
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
      map((currentContractOrderCommission) => {
        if (!currentContractOrderCommission) {
          throw new Error('Funding Program not found');
        }
        if (currentContractOrderCommission.version !== contractOrderCommission.version) {
          throw new Error('Version conflict: Funding Program has been updated by another user');
        }
        return contractOrderCommission;
      }),
      switchMap((validatedContractOrderCommission: ContractOrderCommission) => this.contractOrderCommissionService.updateContractOrderCommission(validatedContractOrderCommission)),
      catchError((err) => {
        console.error('Error updating contract order commission:', err);
        return throwError(() => err);
      })
    );
  }
}