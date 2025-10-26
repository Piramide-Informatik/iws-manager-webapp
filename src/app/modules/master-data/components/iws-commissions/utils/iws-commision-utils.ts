import { Injectable, inject } from '@angular/core';
import { Observable, catchError, take, throwError, switchMap, map } from 'rxjs';
import { IwsCommissionService } from '../../../../../Services/iws-commission.service';
import { IwsCommission } from '../../../../../Entities/iws-commission ';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

@Injectable({ providedIn: 'root' })
export class IwsCommissionUtils {
  private readonly iwsCommissionService = inject(IwsCommissionService);

  loadInitialData(): Observable<IwsCommission[]> {
    return this.iwsCommissionService.loadInitialData();
  }

  addIwsCommission(
    iwsCommission: Omit<
      IwsCommission,
      'id' | 'createdAt' | 'updatedAt' | 'version'
    >
  ): Observable<IwsCommission> {
    const threshold = iwsCommission.fromOrderValue;
    if (threshold === null || threshold === undefined) {
      return throwError(() => new Error('Threshold is required'));
    }

    return this.iwsCommissionThresholdExists(threshold).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(() => new Error('threshold already exists'));
        }
        return this.iwsCommissionService.addIwsCommission(iwsCommission);
      }),
      catchError((err) => {
        if (err.message === 'threshold already exists') {
          return throwError(() => err);
        }
        return throwError(() => new Error('IWS_COMMISSIONS.ERROR.CREATION_FAILED'));
      })
    );
  }

  getAllIwsCommission(): Observable<IwsCommission[]> {
    return this.iwsCommissionService.getAllIwsCommissions();
  }

  getIwsCommissionById(id: number): Observable<IwsCommission | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid IwsCommission ID'));
    }

    return this.iwsCommissionService.getIwsCommissionById(id).pipe(
      catchError((err) => {
        console.error('Error fetching IwsCommission:', err);
        return throwError(() => new Error('Failed to load IwsCommission'));
      })
    );
  }

  refreshIwsCommission(): Observable<void> {
    return new Observable<void>((subscriber) => {
      this.iwsCommissionService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  deleteIwsCommission(id: number): Observable<void> {
    return this.iwsCommissionService.deleteIwsCommission(id);
  }

  updateIwsCommission(iwsCommission: IwsCommission): Observable<IwsCommission> {
    if (!iwsCommission?.id) {
      return throwError(() => new Error('Invalid iwsCommission data'));
    }

    const threshold = iwsCommission.fromOrderValue;
    if (threshold === null || threshold === undefined) {
      return throwError(() => new Error('Threshold is required'));
    }

    return this.iwsCommissionService.getIwsCommissionById(iwsCommission.id).pipe(
      take(1),
      switchMap((currentIwsCommission) => {
        if (!currentIwsCommission) {
          return throwError(() => createNotFoundUpdateError('IWS Commission'));
        }
        if (currentIwsCommission.version !== iwsCommission.version) {
          return throwError(() => createUpdateConflictError('IWS Commission'));
        }
        
        // Check if threshold already exists (excluding current commission)
        return this.iwsCommissionThresholdExists(threshold, iwsCommission.id).pipe(
          switchMap((exists) => {
            if (exists) {
              return throwError(() => new Error('threshold already exists'));
            }
            return this.iwsCommissionService.updateIwsCommission(iwsCommission);
          })
        );
      }),
      catchError((err) => {
        console.error('Error updating IWS Commission:', err);
        return throwError(() => err);
      })
    );
  }

  /**
   * Checks if a commission threshold already exists
   * @param threshold - Threshold value to check
   * @param excludeId - ID to exclude from check (for updates)
   * @returns Observable emitting boolean indicating existence
   */
  private iwsCommissionThresholdExists(threshold: number, excludeId?: number): Observable<boolean> {
    return this.iwsCommissionService.getAllIwsCommissions().pipe(
      map(commissions => commissions.some(
        commission => commission.id !== excludeId && 
               commission.fromOrderValue === threshold
      )),
      catchError(() => {
        return throwError(() => new Error('Failed to check threshold existence'));
      })
    );
  }
}