import { Component, EventEmitter, inject, Input, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { EmploymentContract } from '../../../../../Entities/employment-contract';
import { EmployeeContractService } from '../../../services/employee-contract.service';

@Component({
  selector: 'app-employment-contract-modal',
  standalone: false,
  templateUrl: './employment-contract-modal.component.html',
  styleUrl: './employment-contract-modal.component.scss'
})
export class EmploymentContractModalComponent {
  private readonly employmentContractUtils = inject(EmployeeContractService);
  employmentContractForm!: FormGroup;
  employeeNumber: any;
  @Input() modalType: string = "create";
  @Input() employmentContract!: EmploymentContract | undefined;
  @Output() isVisibleModal = new EventEmitter<boolean>();

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
        console.log('employmentContract', this.employmentContract);
        this.fillEmploymentContractForm();
      }
    }
  }

  ngOnInit(): void {
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

    
  }
}
