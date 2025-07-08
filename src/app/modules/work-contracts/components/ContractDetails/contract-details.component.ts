import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnInit, OnChanges {

  ContractDetailsForm!: FormGroup;
  @Input() modalType: string = "create";
  employeeNumber: any;
  @Input() workContract!: any;
  @Output() isVisibleModal = new EventEmitter<boolean>();

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ) { }

  ngOnChanges(changes: SimpleChanges): void {
    let workContractChange = changes['workContract'];
    if (workContractChange && !workContractChange.firstChange) {
      this.workContract = workContractChange.currentValue;
      if (!this.workContract) {
        this.ContractDetailsForm.reset();
      } else {
        this.fillWorkContractForm();
      }
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
    this.isVisibleModal.emit(false);
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
      customer: this.workContract.customer?.customername1,
      personalnr: this.workContract.employee?.id,
      vorname: this.workContract.employee?.firstname,
      nachname: this.workContract.employee?.lastname,
      datum: this.workContract.startDate,
      gehalt: this.workContract.salaryPerMonth,
      wochenstunden: this.workContract.hoursPerWeek,
      kurz: this.workContract.workShortTime,
      jahresauszahlung: this.workContract.specialPayment,
      maxstudenmonat: this.workContract.maxHoursPerMonth,
      maxstudentag: this.workContract.maxHoursPerDay,
      stundensatz: this.workContract.hourlyRate
    })
  }
}
