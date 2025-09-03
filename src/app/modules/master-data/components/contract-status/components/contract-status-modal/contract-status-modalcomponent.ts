import { Component, EventEmitter, Output, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContractStatus } from '../../../../../../Entities/contractStatus';

@Component({
  selector: 'app-contract-status-modal',
  standalone: false,
  templateUrl: './contract-status-modal.component.html',
  styleUrls: ['./contract-status-modal.component.scss']
})

export class ContractStatusModalComponent implements OnInit {

  @ViewChild('statusInput') statusInput!: ElementRef<HTMLInputElement>;
  @Input() modalType: 'create' | 'delete' = 'create';
  @Input() selectedContractStatus: ContractStatus | null = null;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() contractStatusCreated = new EventEmitter<any>();
  @Output() contractStatusDeleted = new EventEmitter<ContractStatus>();

  isContractStatusLoading = false;

  readonly createContractStatusForm = new FormGroup({
    status: new FormControl('', [Validators.required])
  });

  ngOnInit(): void {
    this.createContractStatusForm.reset();
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onDeleteContractStatusConfirm(): void {
    this.isContractStatusLoading = true;
    if (this.selectedContractStatus) {
      this.contractStatusDeleted.emit(this.selectedContractStatus);
      this.isContractStatusLoading = false;
    }
  }

  onSubmit(): void {
    if (this.createContractStatusForm.invalid) return;
    const formValue = this.createContractStatusForm.value;
    formValue.status = formValue.status?.trim();
    this.contractStatusCreated.emit(formValue);
    this.isVisibleModal.emit(false);
    this.isContractStatusLoading = false;
  }

  handleClose(): void {
    this.isContractStatusLoading = false;
    this.isVisibleModal.emit(false);
    this.createContractStatusForm.reset();
  }

  public focusInputIfNeeded() {
    if (this.isCreateMode && this.statusInput) {
      setTimeout(() => {
        if (this.statusInput?.nativeElement) {
          this.statusInput.nativeElement.focus();
        }
      }, 150);
    }
  }
}