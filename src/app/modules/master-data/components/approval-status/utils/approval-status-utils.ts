import { Injectable, inject } from "@angular/core";
import { Observable, catchError, take, throwError, switchMap, map } from "rxjs";
import { ApprovalStatus } from "../../../../../Entities/approvalStatus";
import { ApprovalStatusService } from "../../../../../Services/approval-status.service";
import { createNotFoundUpdateError, createUpdateConflictError} from "../../../../shared/utils/occ-error";

@Injectable({ providedIn: 'root' })
export class ApprovalStatusUtils {
  private readonly approvalStatusService = inject(ApprovalStatusService);

  loadInitialData(): Observable<ApprovalStatus[]> {
    return this.approvalStatusService.loadInitialData();
  }

  // Get ApprovalStatus by ID
  getApprovalStatusById(id: number): Observable<ApprovalStatus | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid approvalStatus ID'));
    }
    return this.approvalStatusService.getApprovalStatusById(id).pipe(
      catchError(err => {
        console.error('Error fetching approvalStatus:', err);
        return throwError(() => new Error('Failed to load approvalStatus'));
      })
    );
  }

  // Create new ApprovalStatus
  createNewApprovalStatus(
    approvalStatus: Omit<ApprovalStatus, 'id' | 'createdAt' | 'updatedAt' | 'version'>
  ): Observable<ApprovalStatus> {
    return this.approvalStatusExists(approvalStatus.status).pipe(
      switchMap((exists) => {
        if (exists) {
          return throwError(() => new Error('status already exists'));
        }
        return this.approvalStatusService.addApprovalStatus(approvalStatus);
      }),
      catchError((err) => {
        if (err.message === 'status already exists') {
          return throwError(() => err);
        }
        return throwError(() => new Error('APPROVAL_STATUS.ERROR.CREATION_FAILED'));
      })
    );
  }

  // Check if approvalStatus already exists
  approvalStatusExists(status: string): Observable<boolean> {
    return this.approvalStatusService.getAllApprovalStatuses().pipe(
      map((approvalStatuses: ApprovalStatus[]) =>
        approvalStatuses.some((t: ApprovalStatus) => 
          t.status?.toString().toLowerCase() === status.toString().toLowerCase()
        )
      ),
      catchError(err => {
        console.error('Error checking approvalStatus existence:', err);
        return throwError(() => new Error('Failed to check approvalStatus existence'));
      })
    );
  }

  // Refresh approvalStatuses data
  refreshApprovalStatuses(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.approvalStatusService.refreshApprovalStatuses();
      subscriber.next();
      subscriber.complete();
    });
  }

  deleteApprovalStatus(id: number): Observable<void> {
    return this.approvalStatusService.deleteApprovalStatus(id);
  }

  // Update ApprovalStatus by ID
  updateApprovalStatus(approvalStatus: ApprovalStatus): Observable<ApprovalStatus> {
    if (!approvalStatus?.id) {
      return throwError(() => new Error('Invalid approvalStatus data'));
    }

    return this.approvalStatusService.getApprovalStatusById(approvalStatus.id).pipe(
      take(1),
      switchMap((currentApprovalStatus) => {
        if (!currentApprovalStatus) {
          return throwError(() => createNotFoundUpdateError('ApprovalStatus'));
        }
        if (currentApprovalStatus.version !== approvalStatus.version) {
          return throwError(() => createUpdateConflictError('ApprovalStatus'));
        }
        
        return this.approvalStatusExists(approvalStatus.status).pipe(
          switchMap((exists) => {
            if (exists && currentApprovalStatus.status?.toLowerCase() !== approvalStatus.status?.toLowerCase()) {
              return throwError(() => new Error('status already exists'));
            }
            return this.approvalStatusService.updateApprovalStatus(approvalStatus);
          })
        );
      }),
      catchError((err) => {
        console.error('Error updating approvalStatus:', err);
        return throwError(() => err);
      })
    );
  }
}