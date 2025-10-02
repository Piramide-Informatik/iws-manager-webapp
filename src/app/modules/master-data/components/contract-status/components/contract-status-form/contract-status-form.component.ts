import { Component, ElementRef, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormGroup, FormControl } from '@angular/forms';
import { ContractStatus } from '../../../../../../Entities/contractStatus';

@Component({
  selector: 'app-contract-status-form',
  standalone: false,
  templateUrl: './contract-status-form.component.html',
  styleUrl: './contract-status-form.component.scss'
})
export class ContractStatusFormComponent implements OnInit, OnChanges {
  @Input() contractStatus!: ContractStatus;
  @Input() isLoading: boolean = false;
  contractStatusForm!: FormGroup;
  @Output() contractStatusToEdit = new EventEmitter<ContractStatus>();
  @Output() cancelEditContractStatus = new EventEmitter<any>();
  @ViewChild('firstInput') firstInput!: ElementRef<HTMLInputElement>;
  
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
      status: new FormControl('')
    });
  }

  onSubmit(): void {
    if (this.contractStatusForm.valid) {
      const value = this.contractStatusForm.value;
      this.contractStatus.status = value.status;
      this.contractStatusToEdit.emit(this.contractStatus);
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