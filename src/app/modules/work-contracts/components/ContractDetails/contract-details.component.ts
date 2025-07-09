import { Component, EventEmitter, inject, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MessageService } from 'primeng/api';
import { EmploymentContractUtils } from '../../../employee/utils/employment-contract-utils';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnInit, OnChanges, OnDestroy {

  // private readonly subscription = inject(Subscription);
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  ContractDetailsForm!: FormGroup;
  @Input() modalType: string = "create";
  employeeNumber: any;
  @Input() workContract!: any;
  @Output() isVisibleModal = new EventEmitter<boolean>();
  @Output() onEmployeeContractDeleted = new EventEmitter<number>();
  private readonly employmentContractUtils = inject(EmploymentContractUtils);

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
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
    this.initForm();
  }

  ngOnDestroy(): void {
    // if (this.subscription) {
    //   this.subscription.unsubscribe();
    // }
  }

  onSubmit() {
    console.log(this.modalType);
    if (this.modalType === 'create') {
      this.createEmploymentContract();
    } else if (this.modalType === 'edit') {
      this.updateEmploymentContract();
    } else if (this.modalType === 'delete') {
      this.removeEmploymentContract();
    }
  }

  createEmploymentContract() {
    //TODO: Implement create employment contract logic
  }
  
  updateEmploymentContract() {
    console.log(this.workContract);
    //TODO: Implement update employment contract logic
  }



  initForm() {
    this.ContractDetailsForm = new FormGroup({
      customer: new FormControl('', [Validators.required]),
      personalnr: new FormControl(''),
      vorname: new FormControl(''),
      nachname: new FormControl(''),
      datum: new FormControl(''),
      gehalt: new FormControl(''),
      wochenstunden: new FormControl(''),
      kurz: new FormControl(''),
      jahresauszahlung: new FormControl(''),
      maxstudenmonat: new FormControl(''),
      maxstudentag: new FormControl(''),
      stundensatz: new FormControl(''),
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

  removeEmploymentContract() {
    if (this.workContract) {
      this.employmentContractUtils.deleteEmploymentContract(this.workContract).subscribe({
        next: () => {
          this.isVisibleModal.emit(false);
          this.onEmployeeContractDeleted.emit(this.workContract);
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

  fillWorkContractForm() {
    if (typeof this.workContract === 'object') {
      this.ContractDetailsForm.patchValue({
        customer: this.workContract.customer?.customername1,
        personalnr: this.workContract.employee?.id,
        vorname: this.workContract.employee?.firstname,
        nachname: this.workContract.employee?.lastname,
        datum: this.workContract.startDate? new Date(this.workContract.startDate) : null,
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
}
