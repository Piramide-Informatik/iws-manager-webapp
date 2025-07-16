import { Component, inject, Input, Output, EventEmitter } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormGroup } from '@angular/forms';
import { map } from 'rxjs';
import { CountryUtils } from '../../../master-data/components/countries/utils/country-util';
import { ContractorUtils } from '../../utils/contractor-utils';
import { Contractor } from '../../../../Entities/contractor';
import { Customer } from '../../../../Entities/customer';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { ActivatedRoute } from '@angular/router';
@Component({
  selector: 'app-contractor-details',
  standalone: false,
  templateUrl: './contractor-details.component.html',
  styleUrl: './contractor-details.component.scss'
})
export class ContractorDetailsComponent {
  private readonly contractorUtils = inject(ContractorUtils);
  private readonly countryUtils = inject(CountryUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly route = inject(ActivatedRoute);

  public contractId!: number;
  public contractorForm!: FormGroup;

  @Input() currentCustomer!: Customer | undefined;
  @Input() contractor!: Contractor;
  @Input() modalContractType: 'create' | 'edit' | 'delete' = 'create';
  @Output() isContractVisibleModal = new EventEmitter<boolean>();
  @Output() onMessageOperation = new EventEmitter<{severity: string, summary: string, detail: string}>()
  
  countries = toSignal(
    this.countryUtils.getCountriesSortedByName().pipe(
      map(countries => countries.map(country => ({
        id: country.id,
        name: country.name
      })))
    )
  );

  constructor(
    private readonly fb: FormBuilder
  ) {}

  ngOnInit(): void {
    this.initContractorForm();
    this.route.params.subscribe(params => {
      const customerId = params['id'];

      this.customerUtils.getCustomerById(customerId).subscribe(customer => {
        this.currentCustomer = customer;
      });

    });
  }

  private initContractorForm(): void {
    this.contractorForm = this.fb.group({
      label: [''],
      name: [''],
      country: [''],
      street: [''],
      zipCode: [''],
      city: [''],
      taxNumber: ['']
    });
  }

  get isCreateContractorMode(): boolean {
    return this.modalContractType !== 'delete';
  }

  onSubmit() {
    if (this.contractorForm.valid) {

      if (this.modalContractType === 'create') {
        const newContractor = this.buildContractorFromForm();

        this.createContractor(newContractor);
      } else if(this.modalContractType === 'edit') {
        console.log('edit');
      } else {
        console.log('delete');
      }
    }
  }

  private createContractor(newContractor: Omit<Contractor, 'id'>): void {
    this.contractorUtils.createNewContractor(newContractor).subscribe({
      next: () => {
        this.handleMessageOperation({
          severity: 'success',
          summary: 'MESSAGE.SUCCESS',
          detail: 'MESSAGE.CREATE_SUCCESS'
        });
        this.closeModal();
      },
      error: (err) => {
        console.log('Error creating contractor', err);
        this.handleMessageOperation({
          severity: 'error',
          summary: 'MESSAGE.ERROR',
          detail: 'MESSAGE.CREATE_FAILED'
        });
        this.closeModal();
      }
    });
  }

  private buildContractorFromForm(): Omit<Contractor, 'id'> {
    return {
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      city: this.contractorForm.value.city,
      label: this.contractorForm.value.label,
      name: this.contractorForm.value.name,
      number: 0,
      street: this.contractorForm.value.street,
      taxNumber: this.contractorForm.value.taxNumber,
      zipCode: this.contractorForm.value.zipCode,
      country: {
        id: this.contractorForm.value.country,
        version: 0,
        createdAt: '',
        updatedAt: '',
        isDefault: false,
        label: '',
        name: ''
      },
      customer: this.currentCustomer? this.currentCustomer : null
    }
  }

  private handleMessageOperation(message: {severity: string, summary: string, detail: string}): void {
    this.onMessageOperation.emit(message);
  }

  closeModal(): void {
    this.isContractVisibleModal.emit(false);
    this.contractorForm.reset();
  }
}
