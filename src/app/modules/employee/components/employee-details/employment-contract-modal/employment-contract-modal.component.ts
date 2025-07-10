import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmploymentContract } from '../../../../../Entities/employment-contract';
import { EmploymentContractUtils } from '../../../utils/employment-contract-utils';
import { Employee } from '../../../../../Entities/employee';
import { Subscription } from 'rxjs';
import { TranslateService } from '@ngx-translate/core';
import { MessageService } from 'primeng/api';
import { buildCustomer } from '../../../../shared/utils/builders/customer';
import { buildEmployee } from '../../../../shared/utils/builders/employee';

@Component({
  selector: 'app-employment-contract-modal',
  standalone: false,
  templateUrl: './employment-contract-modal.component.html',
  styleUrl: './employment-contract-modal.component.scss'
})
export class EmploymentContractModalComponent {

  private readonly subscription = new Subscription();
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);
  private readonly employmentContractUtils = inject(EmploymentContractUtils);

  @Input() modalType: string = "create";
  @Input() employmentContract!: any;
  @Input() currentEmployee!: Employee;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() messageOperation = new EventEmitter<{ severity: string, summary: string, detail: string }>();
  @Output() onOperationEmploymentContract = new EventEmitter<number>();
  @Output() onEmployeeContractUpdated = new EventEmitter<EmploymentContract>();
  @Output() onEmployeeContractDeleted = new EventEmitter<number>();
  @Output() onEmployeeContractCreated = new EventEmitter<EmploymentContract>(); // falta implementar

  isLoading = false;
  errorMessage: string | null = null;
  employmentContractForm!: FormGroup;
  employeeNumber: any;
  private loading = false;
  public showOCCErrorModalContract = false;

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    let employmentContractChange = changes['employmentContract'];
    if (employmentContractChange && !employmentContractChange.firstChange) {
      this.employmentContract = employmentContractChange.currentValue;
      if (!this.employmentContract) {
        this.employmentContractForm.reset();
      } else {
        this.fillEmploymentContractForm();
      }
    }
  }

  ngOnInit(): void {
    this.initFormEmploymentContract();
  }

  private initFormEmploymentContract(): void {
    this.employmentContractForm = new FormGroup({
      startDate: new FormControl(''),
      salaryPerMonth: new FormControl(''),
      hoursPerWeek: new FormControl(''),
      workShortTime: new FormControl(''),
      specialPayment: new FormControl(''),
      maxHoursPerMonth: new FormControl(''),
      maxHoursPerDay: new FormControl(''),
      hourlyRate: new FormControl(''),
    });
  }

  goBackListContracts() {
    this.isVisibleModal.emit(false);
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
      startDate: this.employmentContract?.startDate? new Date(this.employmentContract.startDate) : null,
      salaryPerMonth: this.employmentContract?.salaryPerMonth,
      hoursPerWeek: this.employmentContract?.hoursPerWeek,
      workShortTime: this.employmentContract?.workShortTime,
      specialPayment: this.employmentContract?.specialPayment,
      maxHoursPerMonth: this.employmentContract?.maxHoursPerMonth,
      maxHoursPerDay: this.employmentContract?.maxHoursPerDay,
      hourlyRate: this.employmentContract?.hourlyRate
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
    if (this.employmentContractForm.invalid || this.isLoading) return;

    this.isLoading = true;
    this.errorMessage = null;

    const newEmploymentContract: Omit<EmploymentContract, 'id' | 'createdAt' | 'updatedAt' | 'version'> = {
      startDate: this.employmentContractForm.value.startDate,
      salaryPerMonth: this.employmentContractForm.value.salaryPerMonth,
      hoursPerWeek: this.employmentContractForm.value.hoursPerWeek,
      workShortTime: this.employmentContractForm.value.workShortTime,
      specialPayment: this.employmentContractForm.value.specialPayment,
      maxHoursPerMonth: this.employmentContractForm.value.maxHoursPerMonth,
      maxHoursPerDay: this.employmentContractForm.value.maxHoursPerDay,
      hourlyRate: this.employmentContractForm.value.hourlyRate,
      hourlyRealRate: 0,
      employee: this.currentEmployee,
      customer: this.currentEmployee.customer ?? null
    };

    this.employmentContractUtils.createNewEmploymentContract(newEmploymentContract).subscribe({
      next: () => {
        this.isLoading = false;
        this.onOperationEmploymentContract.emit(this.currentEmployee.id);
        console.log('Employment contract created successfully');
        this.isVisibleModal.emit(false);
        this.messageOperation.emit({
          severity: 'success',
          summary: 'MESSAGE.SUCCESS',
          detail: 'MESSAGE.CREATE_SUCCESS'
        })
        this.employmentContractForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.message;
        console.error('Error creating employment contract:', error);
        this.isVisibleModal.emit(false);
        this.messageOperation.emit({
          severity: 'error',
          summary: 'MESSAGE.ERROR',
          detail: 'MESSAGE.CREATE_FAILED'
        });
        this.employmentContractForm.reset();
      }
    });
  }

  removeEmploymentContract() {
    if (this.employmentContract) {
      console.log('Removing employment xxxx:', this.employmentContract);
      this.employmentContractUtils.deleteEmploymentContract(this.employmentContract).subscribe({
        next: () => {
          this.isVisibleModal.emit(false);
          this.onEmployeeContractDeleted.emit(this.employmentContract);
          this.messageService.add({
            severity: 'success',
            summary: this.translate.instant('MESSAGE.SUCCESS'),
            detail: this.translate.instant('MESSAGE.DELETE_SUCCESS')
          });
        },
        error: (error) => {
          this.messageService.add({
            severity: 'error',
            summary: this.translate.instant('MESSAGE.ERROR'),
            detail: this.translate.instant('MESSAGE.DELETE_FAILED')
          });
        }
      });
    }
  }

  private handleUpdateSuccess(updatedContract: EmploymentContract): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS')
    });
    this.isVisibleModal.emit(false);
    this.onEmployeeContractUpdated.emit(updatedContract);
  }

  private handleUpdateError(error: Error): void {
    if (error.message.startsWith('VERSION_CONFLICT:')) {
      this.showOCCErrorModalContract = true;
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
      startDate: formValues.startDate,
      salaryPerMonth: formValues.salaryPerMonth,
      hoursPerWeek: formValues.hoursPerWeek,
      workShortTime: formValues.workShortTime,
      specialPayment: formValues.specialPayment,
      maxHoursPerMonth: formValues.maxHoursPerMonth,
      maxHoursPerDay: formValues.maxHoursPerDay,
      hourlyRate: formValues.hourlyRate,
      hourlyRealRate: formValues.hourlyRealRate,
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
    this.loading = true;
    const updatedContract = this.buildEmploymentContract(this.employmentContract?.customer, this.employmentContract?.employee);

    console.log('Updating employment contract:', updatedContract);
    this.subscription.add(this.employmentContractUtils.updateEmploymentContract(updatedContract)
      .subscribe({
        next: (updated) => this.handleUpdateSuccess(updated),
        error: (err) => this.handleUpdateError(err),
        complete: () => this.loading = false
      }));
  }

}
