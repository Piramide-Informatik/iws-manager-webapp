import { Component, EventEmitter, inject, Input, OnDestroy, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-contract-details',
  standalone: false,
  templateUrl: './contract-details.component.html',
  styleUrl: './contract-details.component.scss'
})
export class ContractDetailsComponent implements OnInit, OnDestroy {

  private readonly subscription = new Subscription();
  private readonly translate = inject(TranslateService);
  private readonly messageService = inject(MessageService);

  public showOCCErrorModalContract = false;

  ContractDetailsForm!: FormGroup;
  @Input() modalType: string = "create";
  employeeNumber: any;
  @Input() workContract!: any;
  @Output() isVisibleModal = new EventEmitter<boolean>();


  
  ngOnInit(): void {
    this.ContractDetailsForm = new FormGroup({
      startDate: new FormControl(''),
      salaryPerMonth: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      hoursPerWeek: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      workShortTime: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      specialPayment: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      maxHoursPerMonth: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      maxHoursPerDay: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
      hourlyRate: new FormControl('', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]),
    });
  }

  

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
}
