import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmploymentContract } from '../../../../../Entities/employment-contract';
import { EmploymentContractUtils } from '../../../utils/employment-contract-utils';
import { Employee } from '../../../../../Entities/employee';

@Component({
  selector: 'app-employment-contract-modal',
  standalone: false,
  templateUrl: './employment-contract-modal.component.html',
  styleUrl: './employment-contract-modal.component.scss'
})
export class EmploymentContractModalComponent {
  private readonly employmentContractUtils = inject(EmploymentContractUtils);
  employmentContractForm!: FormGroup;
  employeeNumber: any;
  @Input() modalType: string = "create";
  @Input() employmentContract!: EmploymentContract | undefined;
  @Input() currentEmployee!: Employee;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() messageOperation = new EventEmitter<{severity: string, summary: string, detail: string}>();
  @Output() onOperationEmploymentContract = new EventEmitter<number>();

  isLoading = false;
  errorMessage: string | null = null;

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
      startDate: new FormControl('', [Validators.required]),
      salaryPerMonth: new FormControl('', [Validators.required]),
      hoursPerWeek: new FormControl('', [Validators.required]),
      workShortTime: new FormControl('', [Validators.required]),
      specialPayment: new FormControl('', [Validators.required]),
      maxHoursPerMonth: new FormControl('', [Validators.required]),
      maxHoursPerDay: new FormControl('', [Validators.required]),
      hourlyRate: new FormControl('', [Validators.required]),
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
      startDate: this.employmentContract?.startDate,
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
    if(this.employmentContractForm.invalid || this.isLoading) return;

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
      next: (response) => {
        this.isLoading = false;
        this.onOperationEmploymentContract.emit(response.id);
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
}
