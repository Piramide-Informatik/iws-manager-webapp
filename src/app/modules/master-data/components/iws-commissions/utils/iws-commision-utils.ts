import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  take,
  throwError,
  switchMap,
  of,
} from 'rxjs';
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
    return this.iwsCommissionService.addIwsCommission(iwsCommission);
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
  //Delete a IwsCommission by ID after checking if it's used by any entity
  deleteIwsCommission(id: number): Observable<void> {
    return this.checkIwsCommissionUsage(id).pipe(
      switchMap((isUsed) => {
        if (isUsed) {
          return throwError(
            () =>
              new Error(
                'Cannot delete register: it is in use by other entities'
              )
          );
        }
        return this.iwsCommissionService.deleteIwsCommission(id);
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }
  //Checks if a IwsCommission is used by any entity
  private checkIwsCommissionUsage(idIwsCommission: number): Observable<boolean> {
    return of(false);
  }
  //Update a IwsCommission by ID and updates the internal IwsCommission signal
  updateIwsCommission(iwsCommission: IwsCommission): Observable<IwsCommission> {
    if (!iwsCommission?.id) {
      return throwError(() => new Error('Invalid iwsCommission data'));
    }

    return this.iwsCommissionService.getIwsCommissionById(iwsCommission.id).pipe(
      take(1),
      switchMap((currentIwsCommission) => {
        if (!currentIwsCommission) {
          return throwError(() => createNotFoundUpdateError('Title'));
        }
        if (currentIwsCommission.version !== iwsCommission.version) {
          return throwError(() => createUpdateConflictError('Title'));
        }
        return this.iwsCommissionService.updateIwsCommission(iwsCommission);
      }),
      catchError((err) => {
        console.error('Error updating employeeIws:', err);
        return throwError(() => err);
      })
    );
  }
}
