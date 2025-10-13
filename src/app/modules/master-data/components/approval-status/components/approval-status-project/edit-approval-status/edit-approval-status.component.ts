import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ApprovalStatus } from '../../../../../../../Entities/approvalStatus';
import { Subscription } from 'rxjs';
import { ApprovalStatusUtils } from '../../../utils/approval-status-utils';
import { TranslateService } from '@ngx-translate/core';
import { ApprovalStatusStateService } from '../../../utils/approval-status-state.service';
import { CommonMessagesService } from '../../../../../../../Services/common-messages.service';

@Component({
  selector: 'app-edit-approval-status',
  standalone: false,
  templateUrl: './edit-approval-status.component.html',
  styleUrl: './edit-approval-status.component.scss',
})
export class EditApprovalStatusComponent implements OnInit, OnDestroy {
  currentApprovalStatus: ApprovalStatus | null = null;
  editApprovalStatusForm!: FormGroup;
  isSaving = false;
  private readonly subscriptions = new Subscription();
  public showOCCErrorModalApprovalStatus = false;
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  constructor(
    private readonly approvalStatusUtils: ApprovalStatusUtils,
    private readonly approvalStatusStateService: ApprovalStatusStateService,
    private readonly commonMessageService: CommonMessagesService,
    private readonly translate: TranslateService
  ) { }

  
  ngOnInit(): void {
    this.initForm();
    this.setupApprovalStatusSubscription();
    // Check if we need to load a approval status after page refresh
    const savedApprovalStatusId = localStorage.getItem('selectedApprovalStatusId');
    if (savedApprovalStatusId) {
      this.loadApprovalStatusAfterRefresh(savedApprovalStatusId);
      localStorage.removeItem('selectedApprovalStatusId');
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initForm(): void {
    this.editApprovalStatusForm = new FormGroup({
      status: new FormControl(''),
      order: new FormControl(null),
      forProject: new FormControl(false),
      forNetwork: new FormControl(false),
    });
  }

  private setupApprovalStatusSubscription(): void {
    this.subscriptions.add(
      this.approvalStatusStateService.currentApprovalStatus$.subscribe(status => {
        this.currentApprovalStatus = status;
        status ? this.loadApprovalStatusData(status) : this.clearForm();
      })
    );
  }

  private loadApprovalStatusData(status: ApprovalStatus): void {
      this.editApprovalStatusForm.patchValue({
        status: status.status,
        order: status.sequenceNo,
        forProject: !!status.forProjects,
        forNetwork: !!status.forNetworks,
      });
      this.focusInputIfNeeded();
    }

  clearForm(): void {
    this.editApprovalStatusForm.reset();
    this.currentApprovalStatus = null;
    this.isSaving = false;
  }

  private loadApprovalStatusAfterRefresh(approvalStatusId: string): void {
    this.isSaving = true;
    this.subscriptions.add(
      this.approvalStatusUtils.getApprovalStatusById(Number(approvalStatusId)).subscribe({
        next: (status) => {
          if (status) {
            this.approvalStatusStateService.setApprovalStatusToEdit(status);
          }
          this.isSaving = false;
        },
        error: () => {
          this.isSaving = false;
        }
      })
    );
  }

  onSubmit(): void {
    if (this.editApprovalStatusForm.invalid || !this.currentApprovalStatus || this.isSaving) {
          this.markAllAsTouched();
          return;
        }
    
        this.isSaving = true;
        const updatedApprovalStatus: ApprovalStatus = {
          ...this.currentApprovalStatus,
          status: this.editApprovalStatusForm.value.status?.trim(),
          sequenceNo: this.editApprovalStatusForm.value.order,
          forProjects: this.editApprovalStatusForm.value.forProject? 1 : 0,
          forNetworks: this.editApprovalStatusForm.value.forNetwork? 1 : 0,
        };
        this.subscriptions.add(
          this.approvalStatusUtils.updateApprovalStatus(updatedApprovalStatus).subscribe({
            next: () => this.handleSaveSuccess(),
            error: (err) => this.handleError(err)
          })
        );
  }

  private markAllAsTouched(): void {
    Object.values(this.editApprovalStatusForm.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  private handleSaveSuccess(): void {
    this.commonMessageService.showEditSucessfullMessage();
    this.approvalStatusStateService.setApprovalStatusToEdit(null);
    this.clearForm();
  }

  private handleError(err: any): void {
    if (err.message === 'Version conflict: approvalStatus has been updated by another user') {
      this.showOCCErrorModalApprovalStatus = true;
      this.commonMessageService.showConflictMessage();
      return;
    } else {
      this.handleSaveError(err);
    }
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    console.error('Error saving approval status:', error);
    this.commonMessageService.showErrorEditMessage();
    this.isSaving = false;
  }

  onRefresh(): void {
    if (this.currentApprovalStatus?.id) {
      localStorage.setItem('selectedCountryId', this.currentApprovalStatus.id.toString());
      window.location.reload();
    }
  }

  private focusInputIfNeeded(): void {
    if (this.currentApprovalStatus && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}
