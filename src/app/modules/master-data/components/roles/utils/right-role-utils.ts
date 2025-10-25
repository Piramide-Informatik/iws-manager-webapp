import { Injectable, inject } from '@angular/core';
import {
  Observable,
  catchError,
  take,
  throwError,
  switchMap,
} from 'rxjs';
import { RightRoleService } from '../../../../../Services/rightrole.service';
import { RightRole } from '../../../../../Entities/rightRole';
import { createNotFoundUpdateError, createUpdateConflictError } from '../../../../shared/utils/occ-error';

@Injectable({ providedIn: 'root' })
export class RightRoleUtils {
  private readonly rightRoleService = inject(RightRoleService);

  loadInitialData(): Observable<RightRole[]> {
    return this.rightRoleService.loadInitialData();
  }

  addRightRole(
    rightRole: Omit<RightRole, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Observable<RightRole> {
    return this.rightRoleService.addRightRole(rightRole);
  }

  getAllRightRole(): Observable<RightRole[]> {
    return this.rightRoleService.getAllRightRole();
  }

  getRightRoleById(id: number): Observable<RightRole | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid RightRole ID'));
    }

    return this.rightRoleService.getRightRoleById(id).pipe(
      catchError((err) => {
        console.error('Error fetching RightRole:', err);
        return throwError(() => new Error('Failed to load RightRole'));
      })
    );
  }

  refreshRightRole(): Observable<void> {
    return new Observable<void>((subscriber) => {
      this.rightRoleService.loadInitialData();
      subscriber.next();
      subscriber.complete();
    });
  }

  //Delete a RightRole by ID after checking if it's used by any entity
  deleteRightRole(id: number): Observable<void> {
    return this.rightRoleService.deleteRightRole(id);
  }
 
  //Update a RightRole by ID and updates the internal RightRole signal
  updateRightRole(rightRole: RightRole): Observable<RightRole> {
    if (!rightRole?.id) {
      return throwError(() => new Error('Invalid RightRole data'));
    }

    return this.rightRoleService.getRightRoleById(rightRole.id).pipe(
      take(1),
      switchMap((currentRightRole) => {
        if (!currentRightRole) {
          return throwError(() => createNotFoundUpdateError('RightRole'));
        }
        if (currentRightRole.version !== rightRole.version) {
          return throwError(() => createUpdateConflictError('RightRole'));
        }
        return this.rightRoleService.updateRightRole(rightRole);
      }),
      catchError((err) => {
        console.error('Error updating RightRole:', err);
        return throwError(() => err);
      })
    );
  }

  getRightRolesByModuleId(moduleId: number, roleId: number): Observable<RightRole[]> {
    if (!moduleId || moduleId <= 0) {
      return throwError(() => new Error('Invalid module ID'));
    }

    return this.rightRoleService.getRightRolesByModuleId(moduleId, roleId).pipe(
      catchError((err) => {
        console.error('Error fetching RightRole:', err);
        return throwError(() => new Error('Failed to load RightRole'));
      })
    );
  }

  saveAll(rightRoles: RightRole[]): Observable<RightRole[]> {
    return this.rightRoleService.saveAll(rightRoles).pipe(
      catchError((err) => {
        console.error("Error saving all RightRoles:", err);
        return throwError(() => new Error("Failed to save RightRoles"));
      })
    );
  }
}
