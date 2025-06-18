import { Injectable, inject } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { BranchService } from '../../../Services/branch.service';
import { Branch } from '../../../Entities/branch';

@Injectable({
  providedIn: 'root'
})
export class BranchUtils {
  private readonly branchService = inject(BranchService);

  getBranchesSortedByName(): Observable<Branch[]> {
    return this.branchService.getAllBranches().pipe(
      map(branches => [...branches].sort((a, b) => a.name.localeCompare(b.name))),
      catchError(err => {
        return throwError(() => new Error('Failed to sort branches'));
      })
    );
  }

  getBranchById(id: number): Observable<Branch | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid branch ID'));
    }

    return this.branchService.getBranchById(id).pipe(
      catchError(err => {
        return throwError(() => new Error('Failed to load branch'));
      })
    );
  }

  refreshBranches(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.branchService.refreshBranches();
      subscriber.next();
      subscriber.complete();
    });
  }

  deleteBranch(id: number): Observable<void> {
    return new Observable(observer => {
      this.branchService.deleteBranch(id);

      setTimeout(() => {
        if (!this.branchService.error()) {
          observer.next();
          observer.complete();
        } else {
          observer.error(this.branchService.error());
        }
      }, 100);
    });
  }

  updateBranch(branch: Branch): Observable<void> {
    return new Observable<void>(observer => {
      this.branchService.updateBranch(branch);
      setTimeout(() => {
        if (!this.branchService.error()) {
          observer.next();
          observer.complete();
        } else {
          observer.error(this.branchService.error());
        }
      }, 100);
    });
  }
}