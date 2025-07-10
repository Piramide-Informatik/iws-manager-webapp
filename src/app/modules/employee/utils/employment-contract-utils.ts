import { inject, Injectable } from '@angular/core';
import { EmploymentContractService } from '../../../Services/employment-contract.service';
import { catchError, map, Observable, switchMap, take, throwError } from 'rxjs';
import { EmploymentContract } from '../../../Entities/employment-contract';

@Injectable({ providedIn: 'root' })
/**
 * Utility class for employment-contract-related business logic and operations.
 * Works with EmploymentContractService's reactive signals while providing additional functionality.
 */
export class EmploymentContractUtils {
  private readonly employmentContractService = inject(EmploymentContractService);

  /**
  * Gets all employment contracts without any transformation
  * @returns Observable emitting the raw list of employment contracts
  */
  getAllEmploymentContracts(): Observable<EmploymentContract[]> {
    return this.employmentContractService.getAllEmploymentContracts().pipe(
      catchError(() => throwError(() => new Error('Failed to load employment contracts')))
    );
  }

  /**
  * Gets an employment contract by ID with proper error handling
  * @param id - ID of the employment contract to retrieve
  * @returns Observable emitting the employment contract or undefined if not found
  */
  getEmploymentContractById(id: number): Observable<EmploymentContract | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid employment contract ID'));
    }

    return this.employmentContractService.getEmploymentContractById(id).pipe(
      catchError(() => {
        return throwError(() => new Error('Failed to load employment contract'));
      })
    );
  }

  /**
  * Gets all employment contracts for a given customer
  * @param customerId - Customer ID to get his employment contracts
  * @returns Observable emitting the raw list of employment contracts
  */
  getAllContractsByCustomerId(customerId: number): Observable<EmploymentContract[]> {
    return this.employmentContractService.getContractsByCustomerId(customerId).pipe(
      catchError(() => throwError(() => new Error('Failed to load employment contracts')))
    );
  }

  /**
  * Gets all employment contracts for a given employee
  * @param employeeId - Employee ID to get his employment contracts
  * @returns Observable emitting the raw list of employment contracts
  */
  getAllContractsByEmployeeId(employeeId: number): Observable<EmploymentContract[]> {
    if (!employeeId || employeeId <= 0) {
      return throwError(() => new Error('Invalid employee ID'));
    }

    return this.employmentContractService.getContractsByEmployeeId(employeeId).pipe(
      catchError(() => throwError(() => new Error('Failed to load employment contracts for employee')))
    );
  }

  /**
  * Creates a new employment contract with validation
  * @param contract - Employment contract object to create (without id)
  * @returns Observable that completes when employment contract is created
  */
  createNewEmploymentContract(contract: Omit<EmploymentContract, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<EmploymentContract> {
    return this.employmentContractService.addEmploymentContract(contract);
  }

  /**
  * Checks if an employment contract exists by contract.id (case-insensitive comparison)
  * @param contractId - Contract ID to check
  * @returns Observable emitting boolean indicating existence
  */
  contractExists(contractId: number | string): Observable<boolean> {
    return this.employmentContractService.getAllEmploymentContracts().pipe(
      map(contracts => contracts.some(
        c => c.id !== null && c.id?.toString().toLowerCase() === contractId.toString().toLowerCase()
      )),
      catchError(() => {
        return throwError(() => new Error('Failed to check employment contract existence'));
      })
    );
  }

  /**
  * Gets all employment contracts sorted alphabetically by customer name
  * @returns Observable emitting sorted array of employment contracts
  */
  getContractsSortedByCustomerName(): Observable<EmploymentContract[]> {
    return this.employmentContractService.getAllEmploymentContracts().pipe(
      map((contracts: EmploymentContract[]) => {
        if (!Array.isArray(contracts)) {
          return [];
        }
        // Filtra los contratos con nombre de cliente válido y ordena alfabéticamente
        return contracts
          .filter(contract => !!contract.customer?.customername1 && contract.customer.customername1.trim() !== '')
          .sort((a, b) => (a.customer?.customername1 ?? '').localeCompare(b.customer?.customername1 ?? ''));
      }),
      catchError(() => throwError(() => new Error('Failed to sort employment contracts')))
    );
  }

  /**
   * Refreshes employment contracts data
   * @returns Observable that completes when refresh is done
   */
  refreshEmploymentContracts(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.employmentContractService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
  * Deletes an employment contract by ID and updates the internal contracts signal.
  * @param id - ID of the employment contract to delete
  * @returns Observable that completes when the deletion is done
  */
  deleteEmploymentContract(id: number): Observable<void> {
    console.log('Deleting employment contract with ID:', id);
    return this.employmentContractService.deleteEmploymentContract(id);
  }

  /**
   * Updates an employment contract by ID and updates the internal contracts signal.
   * @param contract - Employment contract object with updated data
   * @returns Observable that completes when the update is done
   * @throws Error with specific codes:
   *         - INVALID_DATA: When contract data is invalid
   *         - NOT_FOUND: When contract doesn't exist
   *         - VERSION_CONFLICT: When version mismatch occurs
   *         - UPDATE_FAILED: For other update errors
   */
  updateEmploymentContract(contract: EmploymentContract): Observable<EmploymentContract> {
    if (!contract?.id) {
      return throwError(() => new Error('INVALID_DATA: Contract ID is required'));
    }

    if (!contract.employee?.id || !contract.customer?.id || !contract.startDate) {
      return throwError(() => new Error('INVALID_DATA: Required contract fields are missing'));
    }

    return this.employmentContractService.getEmploymentContractById(contract.id).pipe(
      take(1),
      switchMap((currentContract) => {
        // Case 1: Contract not found
        if (!currentContract) {
          return throwError(() => new Error('NOT_FOUND: The employment contract has been deleted or does not exist'));
        }

        // Case 2: Version conflict
        if (currentContract.version !== contract.version) {
          return throwError(() => new Error(
            `VERSION_CONFLICT: The contract was modified by another user. ` +
            `Current version: ${currentContract.version}, Your version: ${contract.version}`
          ));
        }

        // Update the contract
        return this.employmentContractService.updateEmploymentContract(contract);
      }),
      catchError((error: Error) => {
        if (error.message.startsWith('INVALID_DATA:') ||
          error.message.startsWith('NOT_FOUND:') ||
          error.message.startsWith('VERSION_CONFLICT:')) {
          return throwError(() => error);
        }

        return throwError(() => new Error(`UPDATE_FAILED: ${error.message}`));
      })
    );
  }
}
