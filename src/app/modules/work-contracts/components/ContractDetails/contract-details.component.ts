import { Component, EventEmitter, inject, Input, OnDestroy, Output } from '@angular/core';
import { FormGroup} from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { EmploymentContractUtils } from '../../../employee/utils/employment-contract-utils';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnDestroy {

  private readonly subscription = new Subscription();
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly employeeContractUtils = inject(EmploymentContractUtils)

  public showOCCErrorModalContract = false;

  ContractDetailsForm!: FormGroup;
  @Input() modalType: string = "create";
  employeeNumber: any;
  @Input() workContract!: any;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() deletedEmployeeContract = new EventEmitter<any>();
  isDeleteEmployeeContract: boolean = false;

  constructor( private readonly commonMessageService: CommonMessagesService) {}
  

  ngOnDestroy(): void {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  onSubmit() {
  }

  goBackListContracts() {
    this.isVisibleModal.emit(false);
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.ContractDetailsForm.reset();
  }

  deleteEmployeeContract() {
    if (this.workContract) {
      this.isDeleteEmployeeContract = true;
      this.employeeContractUtils.deleteEmploymentContract(this.workContract.id).subscribe({
        next: () => {
          this.isDeleteEmployeeContract = false;
          this.isVisibleModal.emit(false);
          this.commonMessageService.showDeleteSucessfullMessage();
          this.deletedEmployeeContract.emit(this.workContract);
        },
        error: (error) => {
          this.isDeleteEmployeeContract = false;
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }
}
