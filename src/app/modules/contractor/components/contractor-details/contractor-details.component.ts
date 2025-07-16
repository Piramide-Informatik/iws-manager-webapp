import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, Subscription } from 'rxjs';
import { CountryUtils } from '../../../master-data/components/countries/utils/country-util';
import { ContractorUtils } from '../../utils/contractor-utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Contractor } from '../../../../Entities/contractor';
import { buildCustomer } from '../../../shared/utils/builders/customer';
import { buildCountry } from '../../../shared/utils/builders/country';

@Component({
  selector: 'app-contractor-details',
  standalone: false,
  templateUrl: './contractor-details.component.html',
  styleUrl: './contractor-details.component.scss'
})
export class ContractorDetailsComponent implements OnInit, OnChanges {

  private readonly countryUtils = inject(CountryUtils);
  private readonly contractorUtils = inject(ContractorUtils);
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly subscription = new Subscription();

  public contractorForm!: FormGroup;
  public showOCCErrorModalContractor = false;
  private loading = false;


  @Input() contractor: Contractor | null = null;
  @Input() modalContractType: 'create' | 'edit' | 'delete' = 'create';
  @Output() isContractVisibleModal = new EventEmitter<boolean>();
  @Output() contractorUpdated = new EventEmitter<Contractor>();

  countries = toSignal(
    this.countryUtils.getCountriesSortedByName().pipe(
      map(countries => countries.map(({ id, name, label }) => ({ id, name, label })))
    ),
    { initialValue: [] }
  );

  constructor(private readonly fb: FormBuilder) {
    this.contractorForm = this.fb.group({
      contractorlabel: ['', Validators.required],
      contractorname: ['', Validators.required],
      country: [null, Validators.required],
      street: [''],
      zipcode: [''],
      city: [''],
      taxno: ['']
    });
  }

  ngOnInit(): void {
    this.initFormContractor();
  }

  private initFormContractor(): void {
    this.contractorForm = new FormGroup({
      contractorlabel: new FormControl(''),
      contractorname: new FormControl(''),
      country: new FormControl(''),
      street: new FormControl(''),
      zipcode: new FormControl(''),
      city: new FormControl(''),
      taxno: new FormControl('')
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['contractor'] && this.modalContractType === 'edit' && this.contractor) {
      this.contractorForm.patchValue({
        contractorlabel: this.contractor.label,
        contractorname: this.contractor.name,
        country: this.contractor.country?.id ?? null,
        street: this.contractor.street,
        zipcode: this.contractor.zipCode,
        city: this.contractor.city,
        taxno: this.contractor.taxNumber
      });
    }
    if (this.modalContractType === 'create') {
      this.contractorForm.reset();
    }
  }

  onSubmit() {
    if (this.modalContractType === 'create') {
      this.createContractor();
    } else if (this.modalContractType === 'edit') {
      this.updateContractor();
    }
  }

  private buildContractor(customerSource: any, countrySource: any): Contractor {
    const formValues = this.contractorForm.value;
    return {
      id: this.contractor?.id ?? 0,
      version: this.contractor?.version ?? 0,
      createdAt: '',
      updatedAt: '',
      customer: this.buildCustomerFromSource(customerSource),
      country: this.buildCountryFromSource(countrySource),
      label: formValues.contractorlabel,
      name: formValues.contractorname,
      number: 0,
      street: formValues.street,
      zipCode: formValues.zipcode,
      city: formValues.city,
      taxNumber: formValues.taxno
    }
  }

  private buildCustomerFromSource(source: any): any {
    return buildCustomer(source, { includeEmptyDates: true });
  }

  private buildCountryFromSource(source: any): any {
    return buildCountry(source);
  }

  private getSelectedCountry(): any {
    const selectedCountryId = this.contractorForm.value.country;
    return this.countries().find(c => c.id === selectedCountryId);
  }

  createContractor() { 
     // comment explaining why the method is empty
  }

  updateContractor() {
    if (!this.validateContractorForUpdate()) return;
    this.loading = true;

    const updatedContractor = this.buildContractor(
      this.contractor?.customer,
      this.getSelectedCountry()
    );

    console.log("Updating contractor:", updatedContractor);

    this.subscription.add(this.contractorUtils.updateContractor(updatedContractor)
      .subscribe({
        next: (updated) => this.handleUpdateSuccess(updated),
        error: (err) => this.handleUpdateError(err),
        complete: () => this.loading = false
      }));
  }

  validateContractorForUpdate(): boolean {
    if (!this.contractor?.id) {
      this.showError(this.translate.instant('MESSAGE.UPDATE_FAILED'))
      return false;
    }
    return true;
  }

  handleUpdateError(error: Error): void {
    if (error.message.startsWith('Conflict detected: contractor version mismatch')) {
      this.showOCCErrorModalContractor = true;
    }
  }

  get isCreateContractorMode(): boolean {
    return this.modalContractType !== 'delete';
  }

  private showSuccess(detail: string): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('TITLE.MESSAGE.SUCCESS'),
      detail
    });
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('TITLE.MESSAGE.ERROR'),
      detail
    });
  }

  private handleUpdateSuccess(updatedContractor: Contractor): void {
    this.messageService.add({
      severity: 'success',
      summary: this.translate.instant('MESSAGE.SUCCESS'),
      detail: this.translate.instant('MESSAGE.UPDATE_SUCCESS')
    });
    this.isContractVisibleModal.emit(false);
    this.contractorUpdated.emit(updatedContractor);
  }

  closeModal(): void {
    this.isContractVisibleModal.emit(false);
    this.contractorForm.reset();
  }
}
