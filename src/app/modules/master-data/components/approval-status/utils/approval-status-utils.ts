import { Injectable, inject } from "@angular/core";
import { Observable, catchError, map, of, switchMap, take, throwError } from "rxjs";
import { ApprovalStatus } from "../../../../../Entities/approvalStatus";
import { ApprovalStatusService } from "../../../../../Services/approval-status.service";
import { createNotFoundUpdateError, createUpdateConflictError } from "../../../../shared/utils/occ-error";

@Injectable({ providedIn: 'root' })
export class ApprovalStatusUtils {
    private readonly approvalStatusService = inject(ApprovalStatusService);
    
    loadInitialData(): Observable<ApprovalStatus[]> {
        return this.approvalStatusService.loadInitialData();
    }

    //Get a approvalStatus by ID
    getApprovalStatusById(id: number): Observable<ApprovalStatus | undefined> {
        if (!id || id <= 0) {
            return throwError(() => new  Error('Invalid approvalStatus ID'));
        }
        return this.approvalStatusService.getApprovalStatusById(id).pipe(
            catchError(err => {
                console.error('Error fetching approvalStatus:', err);
                return throwError(() => new Error('Failed to load approvalStatus'));
            })
        );
    }
    //Creates a new approvalStatus with validation 
    createNewApprovalStatus(approvalStatus:Omit<ApprovalStatus, 'id' | 'createdAt' | 'updatedAt' | 'version'> ): Observable<ApprovalStatus> {
        return this.approvalStatusService.addApprovalStatus(approvalStatus);
    }
    //Check if an approval status already exists
    approvalStatusExists(status: string): Observable<boolean> {
        
        return this.approvalStatusService.getAllApprovalStatuses().pipe(
            map(approvalStatus => approvalStatus.some(
                t => t.status.toLowerCase() === status.toLowerCase()
            )),
            catchError(err => {
                console.error('Error checking projectStatus existence:', err);
                return throwError(() => new Error('Failed to check projectStatus existence'));
            })
        );
        
    }
    //Refreshes approvalStatuses data
    refreshApprovalStatuses(): Observable<void> {
        return new Observable<void>(suscriber =>{
            this.approvalStatusService.refreshApprovalStatuses();
            suscriber.next();
            suscriber.complete();
        });
    }

    //Delete a approvalStatus by Id
    deleteApprovalStatus(id: number): Observable<void> {
        return this.checkApprovalStatusUsage(id).pipe(
            switchMap((isUsed: boolean): Observable<void> => 
            isUsed
                ? throwError(() => new Error('Cannot delete register: it is in use by other entities'))
                : this.approvalStatusService.deleteApprovalStatus(id)
        ),
            catchError(error => {
                return throwError(() => error);
            })
        )
    }

    private checkApprovalStatusUsage(idApprovalStatus: number): Observable<boolean> {
        // For now, no use has been verified in any entity.
        return of(false);
    }

    //Update a approvalStatus by ID and updates the internal approvalStatus signal
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
                    return this.approvalStatusService.updateApprovalStatus(approvalStatus);
                }),
                catchError((err) => {
                    console.error('Error updating approvalStatus:', err);
                    return throwError(() => err);
                })
            );
        }


}