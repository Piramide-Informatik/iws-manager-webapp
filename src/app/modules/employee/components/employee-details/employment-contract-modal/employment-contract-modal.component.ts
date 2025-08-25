import { Component, EventEmitter, inject, Input, OnChanges, OnInit, Output, SimpleChanges, ViewChild } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { EmploymentContract } from '../../../../../Entities/employment-contract';
import { EmploymentContractUtils } from '../../../utils/employment-contract-utils';
import { Employee } from '../../../../../Entities/employee';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { buildCustomer } from '../../../../shared/utils/builders/customer';
import { buildEmployee } from '../../../../shared/utils/builders/employee';
import { momentCreateDate, momentFormatDate } from '../../../../shared/utils/moment-date-utils';
import { CommonMessagesService } from '../../../../../Services/common-messages.service';
import { DatePicker } from 'primeng/datepicker';

@Component({
  selector: 'app-employment-contract-modal',
  standalone: false,
  templateUrl: './employment-contract-modal.component.html',
  styleUrl: './employment-contract-modal.component.scss'
})
export class EmploymentContractModalComponent implements OnInit, OnChanges {

  private readonly subscription = new Subscription();
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly employmentContractUtils = inject(EmploymentContractUtils);

  @Input() modalType: string = "create";
  @Input() employmentContract!: any;
  @Input() currentEmployee!: Employee;
  @Input() visible: boolean = false;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() messageOperation = new EventEmitter<{ severity: string, summary: string, detail: string }>();
  @Output() onOperationEmploymentContract = new EventEmitter<number>(); // Create
  @Output() onEmployeeContractUpdated = new EventEmitter<EmploymentContract>();
  @Output() onEmployeeContractDeleted = new EventEmitter<number>();
  @ViewChild('datePicker') firstInputForm!: DatePicker;

  isLoading = false;
  errorMessage: string | null = null;
  employmentContractForm!: FormGroup;
  public showOCCErrorModalContract = false;

  constructor(
    private readonly commonMessageService: CommonMessagesService
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['visible'] || changes['employmentContract']) {
      if (!this.employmentContract) {
        this.initFormEmploymentContract();
        this.employmentContractForm.reset();
      } else {
        this.fillEmploymentContractForm();
      }
      if(this.firstInputForm){
        setTimeout(()=>{
          this.firstInputForm.inputfieldViewChild?.nativeElement.focus();
        },300)
      }
    }
  }

  ngOnInit(): void {
    this.initFormEmploymentContract();
  }

  private initFormEmploymentContract(): void {
    this.employmentContractForm = new FormGroup({
      startDate: new FormControl(''),
      salaryPerMonth: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      hoursPerWeek: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      workShortTime: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      specialPayment: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      maxHoursPerMonth: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      maxHoursPerDay: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      hourlyRate: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      hourlyRealRate: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
    });
  }

  get isCreateMode(): boolean {
    return this.modalType !== 'delete';
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.employmentContractForm.reset();
  }

  fillEmploymentContractForm() {
    this.employmentContractForm.patchValue({
      startDate: momentCreateDate(this.employmentContract?.startDate),
      salaryPerMonth: this.employmentContract?.salaryPerMonth,
      hoursPerWeek: this.employmentContract?.hoursPerWeek,
      workShortTime: this.employmentContract?.workShortTime,
      specialPayment: this.employmentContract?.specialPayment,
      maxHoursPerMonth: this.employmentContract?.maxHoursPerMonth,
      maxHoursPerDay: this.employmentContract?.maxHoursPerDay,
      hourlyRate: this.employmentContract?.hourlyRate,
      hourlyRealRate: this.employmentContract?.hourlyRealRate,
    });
  }

  onSubmit() {
    if (this.modalType === 'create') {
      this.createEmploymentContract();
    } else if (this.modalType === 'edit') {
      this.updateEmploymentContract();
    }
  }

  createEmploymentContract() {
    if (this.employmentContractForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = null;

    const newEmploymentContract: Omit<EmploymentContract, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      startDate: momentFormatDate(this.employmentContractForm.value.startDate),
      salaryPerMonth: this.employmentContractForm.value.salaryPerMonth ?? 0,
      hoursPerWeek: this.employmentContractForm.value.hoursPerWeek?? 0,
      workShortTime: this.employmentContractForm.value.workShortTime?? 0,
      specialPayment: this.employmentContractForm.value.specialPayment?? 0,
      maxHoursPerMonth: this.employmentContractForm.value.maxHoursPerMonth?? 0,
      maxHoursPerDay: this.employmentContractForm.value.maxHoursPerDay?? 0,
      hourlyRate: this.employmentContractForm.value.hourlyRate?? 0,
      hourlyRealRate: this.employmentContractForm.value.hourlyRealRate?? 0,
      employee: this.currentEmployee,
      customer: this.currentEmployee.customer ?? null
    };

    this.employmentContractUtils.createNewEmploymentContract(newEmploymentContract).subscribe({
      next: () => {
        this.isLoading = false;
        this.onOperationEmploymentContract.emit(this.currentEmployee.id);
        this.isVisibleModal.emit(false);
        this.commonMessageService.showCreatedSuccesfullMessage();
        this.employmentContractForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
        this.isVisibleModal.emit(false);
        this.commonMessageService.showErrorCreatedMessage();
        this.employmentContractForm.reset();
      }
    });
  }

  removeEmploymentContract() {
    if (this.employmentContract) {
      this.isLoading = true;
      this.employmentContractUtils.deleteEmploymentContract(this.employmentContract).subscribe({
        next: () => {
          this.isLoading = false;
          this.isVisibleModal.emit(false);
          this.onEmployeeContractDeleted.emit(this.employmentContract);
          console.log('Delete employment contract successfull');
          this.commonMessageService.showDeleteSucessfullMessage();
        },
        error: () => {
          this.isLoading = false;
          this.commonMessageService.showErrorDeleteMessage();
        }
      });
    }
  }

  private handleUpdateSuccess(updatedContract: EmploymentContract): void {
    this.commonMessageService.showEditSucessfullMessage();
    this.isVisibleModal.emit(false);
    this.onEmployeeContractUpdated.emit(updatedContract);
  }

  private handleUpdateError(error: Error): void {
    if (error.message.startsWith('VERSION_CONFLICT:')) {
      this.showOCCErrorModalContract = true;
    } else {
      console.log(error);
      this.commonMessageService.showErrorEditMessage();
    }
  }

  private buildCustomerFromSource(source: any): any {
    return buildCustomer(source, { includeEmptyDates: true });
  }

  private buildEmployeeFromSource(source: any): any {
    return buildEmployee(source, { includeEmptyDates: true });
  }

  private buildEmploymentContract(customerSource: any, employeeSource: any): EmploymentContract {
    const formValues = this.employmentContractForm.value;
    return {
      id: this.employmentContract?.id ?? 0,
      version: this.employmentContract?.version ?? 0,
      customer: this.buildCustomerFromSource(customerSource),
      employee: this.buildEmployeeFromSource(employeeSource),
      startDate: momentFormatDate(formValues.startDate),
      salaryPerMonth: formValues.salaryPerMonth,
      hoursPerWeek: formValues.hoursPerWeek,
      workShortTime: formValues.workShortTime,
      specialPayment: formValues.specialPayment,
      maxHoursPerMonth: formValues.maxHoursPerMonth,
      maxHoursPerDay: formValues.maxHoursPerDay,
      hourlyRate: formValues.hourlyRate,
      hourlyRealRate: formValues.hourlyRealRate ?? 0,
      createdAt: "",
      updatedAt: ""
    };
  }

  private validateContractForUpdate(): boolean {
    if (!this.employmentContract?.id) {
      this.showError('MESSAGE.INVALID_CONTRACT');
      return false;
    }
    return true;
  }

  private showError(messageKey: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('MESSAGE.ERROR'),
      detail: this.translate.instant(messageKey)
    });
  }

  updateEmploymentContract() {
    if (!this.validateContractForUpdate()) return;
    this.isLoading = true;
    const updatedContract = this.buildEmploymentContract(this.employmentContract?.customer, this.employmentContract?.employee);

    this.subscription.add(this.employmentContractUtils.updateEmploymentContract(updatedContract)
      .subscribe({
        next: (updated) =>{
          this.isLoading = false;
          this.handleUpdateSuccess(updated)
        },
        error: (err) => {
          this.isLoading = false;
          this.handleUpdateError(err)
        }
      }));
  }
}