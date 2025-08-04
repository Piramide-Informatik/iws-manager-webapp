import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { ApprovalStatus } from "../../../../../Entities/approvalStatus";

@Injectable({ providedIn: 'root' })
export class ApprovalStatusStateService {
    private readonly editApprovalStatusSource = new BehaviorSubject<ApprovalStatus | null>(null);
    currentApprovalStatus$ = this.editApprovalStatusSource.asObservable();
    
    setApprovalStatusToEdit(approvalStatus: ApprovalStatus | null): void {
        this.editApprovalStatusSource.next(approvalStatus);
    }
    
    clearApprovalStatus() {
        this.editApprovalStatusSource.next(null);
    }
}