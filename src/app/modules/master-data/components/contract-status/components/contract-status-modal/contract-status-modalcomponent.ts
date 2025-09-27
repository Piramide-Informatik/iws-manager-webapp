import { Component, EventEmitter, Output, OnInit, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContractStatus } from '../../../../../../Entities/contractStatus';

@Component({
  selector: 'app-contract-status-modal',
  standalone: false,
  templateUrl: './contract-status-modal.component.html',
  styleUrls: ['./contract-status-modal.component.scss']
})

export class ContractStatusModalComponent implements OnInit, OnChanges {

  @ViewChild('statusInput') statusInput!: ElementRef<HTMLInputElement>;
  @Input() isVisible: boolean = false;
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

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['isVisible'] && this.isVisible){
      this.focusInputIfNeeded();
    }
    if(changes['isVisible'] && !this.isVisible){
      this.createContractStatusForm.reset();
    }
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

  private focusInputIfNeeded() {
    if (this.isCreateMode && this.statusInput) {
      setTimeout(() => {
        if (this.statusInput?.nativeElement) {
          this.statusInput.nativeElement.focus();
        }
      }, 200);
    }
  }
}