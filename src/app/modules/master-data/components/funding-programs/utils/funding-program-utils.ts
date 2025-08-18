import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, forkJoin, of } from 'rxjs';
import { FundingProgramService } from '../../../../../Services/funding-program.service';
import { ProjectUtils } from '../../../../projects/utils/project.utils';
import { OrderUtils } from '../../../../orders/utils/order-utils';
import { FundingProgram } from '../../../../../Entities/fundingProgram';

/**
 * Utility class for fundingProgram-related business logic and operations.
 * Works with FundingProgramService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class FundingProgramUtils {
  private readonly fundingProgramService = inject(FundingProgramService);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly orderUtils = inject(OrderUtils);
  // add basic contract utils

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
   * @param nameFundingProgram - Name for the new funding program
   * @returns Observable that completes when funding program is created
   */
  addFundingProgram(fundingProgram: Omit<FundingProgram, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<FundingProgram> {
    return this.fundingProgramService.addFundingProgram(fundingProgram);
  }

  /**
   * Checks if a fundingProgram exists (case-insensitive comparison)
   * @param name - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  fundingProgramExists(name: string): Observable<boolean> {
    return this.fundingProgramService.getAllFundingPrograms().pipe(
      map(fundingPrograms => fundingPrograms.some(
        f => f.name?.toLowerCase() === name.toLowerCase()
      )),
      catchError(err => {
        console.error('Error checking funding program existence:', err);
        return throwError(() => new Error('Failed to check funding program existence'));
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
    return this.checkFundingProgramUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.fundingProgramService.deleteFundingProgram(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a funding program is used by any customer contacts or employees.
   * @param idFunProgram - ID of the funding program to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkFundingProgramUsage(idFunProgram: number): Observable<boolean> {
    return forkJoin([
      this.projectUtils.getAllProjects().pipe(
        map(projects => projects.some(project => project.fundingProgram?.id === idFunProgram)),
        catchError(() => of(false))
      ),
      this.orderUtils.getAllOrders().pipe(
        map(orders => orders.some(order => order.fundingProgram?.id === idFunProgram)),
        catchError(() => of(false))
      )
    ] as const).pipe(
      map(([usedInProjects, usedInOrders]) => usedInProjects || usedInOrders)
    );
  }

  /**
 * Updates a funding program by ID and updates the internal fundingPrograms signal.
 * @param id - ID of the funding program to update
 * @returns Observable that completes when the update is done
 */
  updateFundingProgram(fundingProgram: FundingProgram): Observable<FundingProgram> {
    if (!fundingProgram?.id) {
      return throwError(() => new Error('Invalid funding program data'));
    }

    return this.fundingProgramService.getFundingProgramById(fundingProgram.id).pipe(
      take(1),
      map((currentFundingProgram) => {
        if (!currentFundingProgram) {
          throw new Error('Funding Program not found');
        }
        if (currentFundingProgram.version !== fundingProgram.version) {
          throw new Error('Version conflict: FundingProgram has been updated by another user');
        }
        return fundingProgram;
      }),
      switchMap((validatedFundingProgram: FundingProgram) => this.fundingProgramService.updateFundingProgram(validatedFundingProgram)),
      catchError((err) => {
        console.error('Error updating funding program:', err);
        return throwError(() => err);
      })
    );
  }
}