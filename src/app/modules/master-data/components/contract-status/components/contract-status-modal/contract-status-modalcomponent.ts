import { Component, EventEmitter, Output, OnInit, Input, ViewChild, ElementRef, OnChanges, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ContractStatus } from '../../../../../../Entities/contractStatus';
import { CommonMessagesService } from '../../../../../../Services/common-messages.service';

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
  @Input() existingContractStatus: ContractStatus[] = [];
  @Input() loadCreateDelete = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() contractStatusCreated = new EventEmitter<any>();
  @Output() contractStatusDeleted = new EventEmitter<ContractStatus>();

  statusAlreadyExist = false;
  readonly createContractStatusForm = new FormGroup({
    status: new FormControl('',[Validators.required])
  });

  constructor(private readonly commonMessageService: CommonMessagesService) {}

  ngOnInit(): void {
    this.createContractStatusForm.reset();

    this.createContractStatusForm.get('status')?.valueChanges.subscribe(() => {
      this.statusAlreadyExist = false;
    });

  }

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['isVisible'] && this.isVisible){
      this.statusAlreadyExist = false;
      setTimeout(() => {
        this.focusInputIfNeeded();
      })
    }
    if(changes['isVisible'] && !this.isVisible){
      this.statusAlreadyExist = false;
      this.createContractStatusForm.reset();
    }
  }

  get isCreateMode(): boolean {
    return this.modalType === 'create';
  }

  onDeleteContractStatusConfirm(): void {
    if (this.selectedContractStatus) {
      this.contractStatusDeleted.emit(this.selectedContractStatus);
    }
  }

  onSubmit(): void {
    if (this.createContractStatusForm.invalid || this.statusAlreadyExist) return;
    const statusName = this.createContractStatusForm.value.status?.trim();
    
    if (!statusName) return;
    
    const isDuplicate = this.existingContractStatus.some(
      status => status.status?.toLowerCase() === statusName.toLowerCase()
    );

    if (isDuplicate) {
      this.statusAlreadyExist = true;
      this.commonMessageService.showErrorRecordAlreadyExist();
      return;
    }
    const formValue = this.createContractStatusForm.value;
    formValue.status = formValue.status?.trim();
    this.contractStatusCreated.emit(formValue);
    this.isVisibleModal.emit(false);
  }

  handleClose(): void {
    this.statusAlreadyExist = false;
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