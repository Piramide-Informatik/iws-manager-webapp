import { Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ApprovalStatus } from '../../../../../../../Entities/approvalStatus';
import { Subscription, take } from 'rxjs';
import { ApprovalStatusUtils } from '../../../utils/approval-status-utils';
import { ApprovalStatusStateService } from '../../../utils/approval-status-state.service';
import { CommonMessagesService } from '../../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-edit-approval-status',
  standalone: false,
  templateUrl: './edit-approval-status.component.html',
  styleUrl: './edit-approval-status.component.scss',
})
export class EditApprovalStatusComponent implements OnInit, OnDestroy {
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  
  public currentApprovalStatus: ApprovalStatus | null = null;
  public showOCCErrorModalApprovalStatus = false;
  public isLoading: boolean = false;
  public occErrorApprovalStatus: OccErrorType = 'UPDATE_UPDATED';
  public statusAlreadyExist = false;
  
  editApprovalStatusForm!: FormGroup;
  private readonly subscriptions = new Subscription();

  constructor(
    private readonly approvalStatusUtils: ApprovalStatusUtils,
    private readonly approvalStatusStateService: ApprovalStatusStateService,
    private readonly commonMessageService: CommonMessagesService
  ) { }

  ngOnInit(): void {
    this.editApprovalStatusForm = new FormGroup({
      status: new FormControl('', [Validators.required]),
      order: new FormControl(null),
      forProject: new FormControl(false),
      forNetwork: new FormControl(false),
    });
    
    this.setupApprovalStatusSubscription();
    this.loadApprovalStatusAfterRefresh();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  onSubmit(): void {
    if (this.editApprovalStatusForm.invalid || !this.currentApprovalStatus || this.statusAlreadyExist) return;
    
    this.isLoading = true;
    const updatedApprovalStatus: ApprovalStatus = {
      ...this.currentApprovalStatus,
      status: this.editApprovalStatusForm.value.status?.trim(),
      sequenceNo: this.editApprovalStatusForm.value.order,
      forProjects: this.editApprovalStatusForm.value.forProject ? 1 : 0,
      forNetworks: this.editApprovalStatusForm.value.forNetwork ? 1 : 0,
    };

    this.approvalStatusUtils.updateApprovalStatus(updatedApprovalStatus).subscribe({
      next: () => {
        this.isLoading = false;
        this.clearForm();
        this.commonMessageService.showEditSucessfullMessage();
      },
      error: (error: Error) => {
        this.isLoading = false;
        if (error instanceof OccError) { 
          this.showOCCErrorModalApprovalStatus = true;
          this.occErrorApprovalStatus = error.errorType;
          this.commonMessageService.showErrorEditMessage();
        } else if (error.message.includes('status already exists')) {
          this.statusAlreadyExist = true;
          this.editApprovalStatusForm.get('status')?.valueChanges.pipe(take(1))
            .subscribe(() => this.statusAlreadyExist = false);
          this.commonMessageService.showErrorEditMessage();
        } else {
          this.commonMessageService.showErrorEditMessage();
        }
      }
    });
  }

  private setupApprovalStatusSubscription(): void {
    this.subscriptions.add(
      this.approvalStatusStateService.currentApprovalStatus$.subscribe(approvalStatus => {
        if (approvalStatus) {
          this.currentApprovalStatus = approvalStatus;
          this.editApprovalStatusForm.patchValue({
            status: this.currentApprovalStatus.status ?? '',
            order: this.currentApprovalStatus.sequenceNo,
            forProject: !!this.currentApprovalStatus.forProjects,
            forNetwork: !!this.currentApprovalStatus.forNetworks,
          });
          this.focusInputIfNeeded();
        } else {
          this.editApprovalStatusForm.reset();
        }
      })
    );
  }

  public onRefresh(): void {
    if (this.currentApprovalStatus?.id) {
      localStorage.setItem('selectedApprovalStatusId', this.currentApprovalStatus.id.toString());
      globalThis.location.reload();
    }
  }

  public clearForm(): void {
    this.editApprovalStatusForm.reset();
    this.approvalStatusStateService.clearApprovalStatus();
    this.currentApprovalStatus = null;
    this.statusAlreadyExist = false;
  }

  private loadApprovalStatusAfterRefresh(): void {
    const savedApprovalStatusId = localStorage.getItem('selectedApprovalStatusId');
    if (savedApprovalStatusId) {
      this.isLoading = true;
      this.subscriptions.add(
        this.approvalStatusUtils.getApprovalStatusById(Number(savedApprovalStatusId)).subscribe({
          next: (approvalStatus) => {
            if (approvalStatus) {
              this.approvalStatusStateService.setApprovalStatusToEdit(approvalStatus);
            }
            this.isLoading = false;
            localStorage.removeItem('selectedApprovalStatusId');
          },
          error: () => {
            this.isLoading = false;
            localStorage.removeItem('selectedApprovalStatusId');
          }
        })
      );
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