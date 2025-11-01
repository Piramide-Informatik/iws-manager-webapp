import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContractStatus } from '../../../../../../Entities/contractStatus';
import { ContractStatusUtils } from '../../utils/contract-status-utils';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../../../shared/utils/occ-error';

@Component({
  selector: 'app-contract-status-form',
  standalone: false,
  templateUrl: './contract-status-form.component.html',
  styleUrl: './contract-status-form.component.scss'
})
export class ContractStatusFormComponent implements OnInit, OnChanges {
  @Input() contractStatus!: ContractStatus;
  @Input() isLoading: boolean = false;
  @Input() existingContractStatus: ContractStatus[] = [];

  contractStatusForm!: FormGroup;
  @Output() contractStatusToEdit = new EventEmitter<ContractStatus | null>();
  @Output() cancelEditContractStatus = new EventEmitter<any>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;

  // Variables OCC
  public showOCCErrorModalContractStatus = false;
  public occErrorContractStatusType: OccErrorType = 'UPDATE_UPDATED';

  private readonly contractStatusUtils = inject(ContractStatusUtils);
  private readonly commonMessageService = inject(CommonMessagesService);
  
  ngOnChanges(changes: SimpleChanges): void {
    let contractStatusChange = changes['contractStatus'];
    if (contractStatusChange && !contractStatusChange.firstChange) {
      this.contractStatus = contractStatusChange.currentValue;
      if (this.contractStatus) {
        this.contractStatusForm.patchValue(this.contractStatus);
        this.focusInputIfNeeded();
      } else {
        this.contractStatusForm.reset();
      }
    }
  }

  ngOnInit(): void {
    this.contractStatusForm = new FormGroup({
      status: new FormControl('', [Validators.required])
    });
    this.loadContractStatusAfterRefresh();
  }

  onSubmit(): void {
    if (this.contractStatusForm.valid && this.contractStatusForm.dirty && this.contractStatus) {
      const statusName = this.contractStatusForm.value.status?.trim();
      const isDuplicate = this.existingContractStatus.some(
        status => status.status === statusName
      );

      if (isDuplicate) {
        this.commonMessageService.showErrorRecordAlreadyExist();
        return;
      }
      this.isLoading = true;
      const value = this.contractStatusForm.value;
      const updatedContractStatus: ContractStatus = {
        ...this.contractStatus,
        status: value.status?.trim()
      };

      this.contractStatusUtils.updateContractStatus(updatedContractStatus).subscribe({
        next: () => {
          this.isLoading = false;
          this.commonMessageService.showEditSucessfullMessage();
          this.contractStatusToEdit.emit(null);
          this.contractStatusForm.reset();
        },
        error: (err) => {
          this.isLoading = false;
          if (err instanceof OccError) { 
            this.showOCCErrorModalContractStatus = true;
            this.occErrorContractStatusType = err.errorType;
          }
          this.commonMessageService.showErrorEditMessage();
        }
      });
    }
  }

  public onRefresh(): void {
    if (this.contractStatus?.id) {
      localStorage.setItem('selectedContractStatusId', this.contractStatus.id.toString());
      globalThis.location.reload();
    }
  }

  private loadContractStatusAfterRefresh(): void {
    const savedContractStatusId = localStorage.getItem('selectedContractStatusId');
    if (savedContractStatusId) {
      this.isLoading = true;
      this.contractStatusUtils.getContractStatusById(Number(savedContractStatusId)).subscribe({
        next: (contractStatus) => {
          this.isLoading = false;
          if (contractStatus) {
            this.contractStatus = contractStatus;
            this.contractStatusForm.patchValue(this.contractStatus);
            this.focusInputIfNeeded();
          }
          localStorage.removeItem('selectedContractStatusId');
        },
        error: () => {
          this.isLoading = false;
          localStorage.removeItem('selectedContractStatusId');
        }
      });
    }
  }

  cancel() {
    this.contractStatusForm.reset();
    this.cancelEditContractStatus.emit(null);
  }

  private focusInputIfNeeded(): void {
    if (this.contractStatus && this.firstInput) {
      setTimeout(() => {
        if (this.firstInput?.nativeElement) {
          this.firstInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}