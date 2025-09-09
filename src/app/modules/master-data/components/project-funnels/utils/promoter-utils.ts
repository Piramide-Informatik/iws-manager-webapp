import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, take, throwError, switchMap, forkJoin, of } from 'rxjs';
import { Promoter } from '../../../../../Entities/promoter';
import { PromoterService } from '../../../../../Services/promoter.service';
import { ProjectUtils } from '../../../../projects/utils/project.utils';
import { OrderUtils } from '../../../../orders/utils/order-utils';
import { ReceivableUtils } from '../../../../receivables/utils/receivable-utils';

/**
 * Utility class for promoter-related business logic and operations.
 * Works with PromoterService's reactive signals while providing additional functionality.
 */
@Injectable({ providedIn: 'root' })
export class PromoterUtils {
  private readonly promoterService = inject(PromoterService);
  private readonly projectUtils = inject(ProjectUtils);
  private readonly orderUtils = inject(OrderUtils);
  private readonly receivableUtils = inject(ReceivableUtils);

  loadInitialData(): Observable<Promoter[]> {
    return this.promoterService.loadInitialData();
  }

  /**
   * Gets a promoter by ID with proper error handling
   * @param id - ID of the promoter to retrieve
   * @returns Observable emitting the promoter or undefined if not found
   */
  getPromoterById(id: number): Observable<Promoter | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid promoter ID'));
    }

    return this.promoterService.getPromoterById(id).pipe(
      catchError(err => {
        console.error('Error fetching promoter:', err);
        return throwError(() => new Error('Failed to load promoter'));
      })
    );
  }

  /**
   * Creates a new promoter with validation
   * @param namePromoter - Name for the new promoter
   * @returns Observable that completes when promoter is created
   */
  addPromoter(promoter: Omit<Promoter, 'id' | 'createdAt' | 'updatedAt' | 'version'>): Observable<Promoter> {
    return this.promoterService.addPromoter(promoter);
  }

  /**
   * Gets all promoters
   * @returns Observable emitting sorted array of promoters
   */
  getAllPromoters(): Observable<Promoter[]> {
    return this.promoterService.getAllPromoters();
  }

  /**
   * Refreshes customers data
   * @returns Observable that completes when refresh is done
  */
  refreshPromoters(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.promoterService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a promoter by ID and updates the internal promoters signal.
 * @param id - ID of the promoter to delete
 * @returns Observable that completes when the deletion is done
 */
  deletePromoter(id: number): Observable<void> {
    return this.checkPromoterUsage(id).pipe(
      switchMap(isUsed => {
        if (isUsed) {
          return throwError(() => new Error('Cannot delete register: it is in use by other entities'));
        }
        return this.promoterService.deletePromoter(id);
      }),
      catchError(error => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Checks if a promoter is used by any debt(receivable), order or project.
   * @param idPromoter - ID of the promoter to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkPromoterUsage(idPromoter: number): Observable<boolean> {
    return forkJoin([
      this.projectUtils.getAllProjects().pipe(
        map(projects => projects.some(project => project.promoter?.id === idPromoter)),
        catchError(() => of(false))
      ),
      this.orderUtils.getAllOrders().pipe(
        map(orders => orders.some(order => order.promoter?.id === idPromoter)),
        catchError(() => of(false))
      ),
      this.receivableUtils.getAllReceivables().pipe(
        map(receivables => receivables.some(receivable => receivable.promoter?.id === idPromoter)),
        catchError(() => of(false))
      )
    ] as const).pipe(
      map(([usedInProjects, usedInOrders, usedInReceivables]) => usedInProjects || usedInOrders || usedInReceivables)
    );
  }

  /**
 * Updates a promoter by ID and updates the internal promoters signal.
 * @param id - ID of the promoter to update
 * @returns Observable that completes when the update is done
 */
  updatePromoter(promoter: Promoter): Observable<Promoter> {
    if (!promoter?.id) {
      return throwError(() => new Error('Invalid promoter data'));
    }

    return this.promoterService.getPromoterById(promoter.id).pipe(
      take(1),
      map((currentPromoter) => {
        if (!currentPromoter) {
          throw new Error('Funding Program not found');
        }
        if (currentPromoter.version !== promoter.version) {
          throw new Error('Version conflict: Funding Program has been updated by another user');
        }
        return promoter;
      }),
      switchMap((validatedPromoter: Promoter) => this.promoterService.updatePromoter(validatedPromoter)),
      catchError((err) => {
        console.error('Error updating promoter:', err);
        return throwError(() => err);
      })
    );
  }
}