import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { WorkContract } from '../../../../Entities/work-contracts';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnInit, OnChanges {

  ContractDetailsForm!: FormGroup;
  @Input() modalType: string = "create";
  @Input() customer!: string;
  employeeNumber: any;
  @Input() workContract!: WorkContract;
  @Output() isVisibleModal = new EventEmitter<boolean>();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    let workContractChange = changes['workContract'];
    if (workContractChange && !workContractChange.firstChange) {
      this.workContract = workContractChange.currentValue;
      this.fillWorkContractForm();
    }

    let customerChange = changes['customer'];
    if (customerChange && !customerChange.firstChange) {
      this.customer = customerChange.currentValue;
      this.ContractDetailsForm.get('customer')?.setValue(this.customer)
    }
  }

  ngOnInit(): void {
    this.ContractDetailsForm = new FormGroup({
      customer: new FormControl('', [Validators.required]),
      personalnr: new FormControl('', [Validators.required]),
      vorname: new FormControl('', [Validators.required]),
      nachname: new FormControl('', [Validators.required]),
      datum: new FormControl('', [Validators.required]),
      gehalt: new FormControl('', [Validators.required]),
      wochenstunden: new FormControl('', [Validators.required]),
      kurz: new FormControl('', [Validators.required]),
      jahresauszahlung: new FormControl('', [Validators.required]),
      maxstudenmonat: new FormControl('', [Validators.required]),
      maxstudentag: new FormControl('', [Validators.required]),
      stundensatz: new FormControl('', [Validators.required]),
    });
  }

  goBackListContracts() {
    this.router.navigate(['../'], { relativeTo: this.activatedRoute });
  }

  get isCreateMode(): boolean {
   return this.modalType !== 'delete';
  }

  closeModal(): void {
    this.isVisibleModal.emit(false);
    this.ContractDetailsForm.reset();
  }

  fillWorkContractForm() {
    this.ContractDetailsForm.patchValue({
      customer: this.customer,
      personalnr: this.workContract.employeeId,
      vorname: this.workContract.firstName,
      nachname: this.workContract.lastName,
      datum: this.workContract.startDate,
      gehalt: this.workContract.salaryPerMonth,
      wochenstunden: this.workContract.weeklyHours,
      kurz: this.workContract.worksShortTime,
      jahresauszahlung: this.workContract.specialPayment,
      maxstudenmonat: this.workContract.maxHrspPerMonth,
      maxstudentag: this.workContract.maxHrsPerDay,
      stundensatz: this.workContract.hourlyRate
    })
  }
}
