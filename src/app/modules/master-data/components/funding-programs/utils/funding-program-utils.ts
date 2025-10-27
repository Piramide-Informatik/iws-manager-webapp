import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap, map } from 'rxjs';
import { FundingProgramService } from '../../../../../Services/funding-program.service';
import { ProjectUtils } from '../../../../projects/utils/project.utils';
import { OrderUtils } from '../../../../orders/utils/order-utils';
import { FundingProgram } from '../../../../../Entities/fundingProgram';
import { FrameworkAgreementsUtils } from '../../../../framework-agreements/utils/framework-agreement.util';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';
type FundingProgramCreateUpdate = Omit<FundingProgram, 'id' | 'createdAt' | 'updatedAt' | 'version'>;

/**
 * Utility class for fundingProgram-related business logic and operations.
 * Works with FundingProgramService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class FundingProgramUtils {
  private readonly fundingProgramService = inject(FundingProgramService);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly orderUtils = inject(OrderUtils);
  private readonly basicContractUtils = inject(FrameworkAgreementsUtils);

  loadInitialData(): Observable<FundingProgram[]> {
    return this.fundingProgramService.loadInitialData();
  }

  /**
   * Gets a funding program by ID with proper error handling
   * @param id - ID of the funding program to retrieve
   * @returns Observable emitting the funding program or undefined if not found
   */
  getFundingProgramById(id: number): Observable<FundingProgram | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid funding program ID'));
    }

    return this.fundingProgramService.getFundingProgramById(id).pipe(
      catchError(err => {
        console.error('Error fetching funding program:', err);
        return throwError(() => new Error('Failed to load funding program'));
      })
    );
  }

  /**
   * Creates a new funding program with validation
   * @param fundingProgram - Funding program data for creation
   * @returns Observable that completes when funding program is created
   */
  addFundingProgram(fundingProgram: FundingProgramCreateUpdate): Observable<FundingProgram> {
    return this.checkFundingProgramNameExists(fundingProgram.name || '').pipe(
      switchMap(() => this.fundingProgramService.addFundingProgram(fundingProgram)),
      catchError((err) => {
        if (err.message === 'name already exists') {
          return throwError(() => err);
        }
        return throwError(() => new Error('Failed to create funding program'));
      })
    );
  }

  /**
   * Checks if a funding program name already exists
   * @param name - Name to check
   * @param excludeId - ID to exclude from check (for updates)
   * @returns Observable emitting void if name is available, error if exists
   */
  checkFundingProgramNameExists(name: string, excludeId?: number): Observable<void> {
    return this.fundingProgramService.getAllFundingPrograms().pipe(
      map(programs => {
        const exists = programs.some(
          program => program.id !== excludeId && 
                 program.name?.toLowerCase().trim() === name.toLowerCase().trim()
        );
        if (exists) {
          throw new Error('name already exists');
        }
      }),
      catchError(() => {
        return throwError(() => new Error('Failed to check name existence'));
      })
    );
  }

  /**
   * Gets all funding programs
   * @returns Observable emitting sorted array of funding programs
   */
  getAllFundingPrograms(): Observable<FundingProgram[]> {
    return this.fundingProgramService.getAllFundingPrograms();
  }

  /**
   * Refreshes customers data
   * @returns Observable that completes when refresh is done
  */
  refreshFundingPrograms(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.fundingProgramService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a funding program by ID and updates the internal funding programs signal.
 * @param id - ID of the funding program to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteFundingProgram(id: number): Observable<void> {
    return this.fundingProgramService.deleteFundingProgram(id);
  }

  /**
 * Updates a funding program by ID and updates the internal fundingPrograms signal.
 * @param fundingProgram - Funding program data to update
 * @returns Observable that completes when the update is done
 */
  updateFundingProgram(fundingProgram: FundingProgram): Observable<FundingProgram> {
    if (!fundingProgram?.id) {
      return throwError(() => new Error('Invalid funding program data'));
    }

    return this.fundingProgramService.getFundingProgramById(fundingProgram.id).pipe(
      take(1),
      switchMap((currentFundingProgram) => {
        if (!currentFundingProgram) {
          return throwError(() => createNotFoundUpdateError('Funding Program'));
        }
        if (currentFundingProgram.version !== fundingProgram.version) {
          return throwError(() => createUpdateConflictError('Funding Program'));
        }
        
        return this.checkFundingProgramNameExists(fundingProgram.name || '', fundingProgram.id).pipe(
          switchMap(() => this.fundingProgramService.updateFundingProgram(fundingProgram))
        );
      }),
      catchError((err) => {
        console.error('Error updating funding program:', err);
        return throwError(() => err);
      })
    );
  }
}