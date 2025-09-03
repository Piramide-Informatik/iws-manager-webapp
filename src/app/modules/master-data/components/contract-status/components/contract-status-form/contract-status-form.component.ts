import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContractStatus } from '../../../../../../Entities/contractStatus';

@Component({
  selector: 'app-contract-status-form',
  standalone: false,
  templateUrl: './contract-status-form.component.html',
  styleUrl: './contract-status-form.component.scss'
})
export class ContractStatusFormComponent implements OnInit, OnChanges {

  @Input() contractStatus!: ContractStatus;
  contractStatusForm!: FormGroup;
  @Output() contractStatusToEdit = new EventEmitter<any>();
  @Output() cancelEditContractStatus = new EventEmitter<any>();
  
  ngOnChanges(changes: SimpleChanges): void {
    let contractStatusChange = changes['contractStatus'];
    if (contractStatusChange && !contractStatusChange.firstChange) {
      this.contractStatus = contractStatusChange.currentValue;
      if (this.contractStatus) {
        this.contractStatusForm.patchValue(this.contractStatus);
      } else {
        this.contractStatusForm.reset();
      }
    }
  }

  ngOnInit(): void {
    this.contractStatusForm = new FormGroup({
      status: new FormControl('', [Validators.required])
    });
  }

  onSubmit(): void {
    if (this.contractStatusForm.valid) {
      const value = this.contractStatusForm.value;
      this.contractStatus.status = value.status;
      this.contractStatusToEdit.emit(this.contractStatus);
    } else {
      console.log("Ungültiges Formular");
    }
  }

  cancel() {
    this.contractStatusForm.reset();
    this.cancelEditContractStatus.emit(null);
  }
}