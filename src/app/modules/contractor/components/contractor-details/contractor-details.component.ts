import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, Validators} from '@angular/forms';
import { map, Subscription } from 'rxjs';
import { CountryUtils } from '../../../master-data/components/countries/utils/country-util';
import { ContractorUtils } from '../../utils/contractor-utils';
import { Contractor } from '../../../../Entities/contractor';
import { Customer } from '../../../../Entities/customer';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { ActivatedRoute } from '@angular/router';
import { buildCustomer } from '../../../shared/utils/builders/customer';
import { buildCountry } from '../../../shared/utils/builders/country';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-contractor-details',
  standalone: false,
  templateUrl: './contractor-details.component.html',
  styleUrl: './contractor-details.component.scss'
})
export class ContractorDetailsComponent implements OnInit, OnChanges, OnDestroy {
  private readonly contractorUtils = inject(ContractorUtils);
  private readonly countryUtils = inject(CountryUtils);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly route = inject(ActivatedRoute);
  private readonly subscription = new Subscription();

  public contractorForm!: FormGroup;
  public isLoading = false;
  public isLoadingDelete = false;
  visibleContractorDeleteEntityModal = false;
  @Output() showOCCErrorModalContractor = new EventEmitter<boolean>();
  @Output() occErrorType = new EventEmitter<OccErrorType>();


  @Input() currentCustomer!: Customer | undefined;
  @Input() contractor: Contractor | null = null;
  @Input() modalContractType: 'create' | 'edit' | 'delete' = 'create';
  @Input() isVisibleModal: boolean = false;

  @Output() isContractVisibleModal = new EventEmitter<boolean>();
  @Output() contractorUpdated = new EventEmitter<Contractor>();
  @Output() onContractorCreated = new EventEmitter<{ status: 'success' | 'error'}>();
  @Output() onContractorDeleted = new EventEmitter<number>();

  @ViewChild('contractorLabelInput') contractorLabelInput!: ElementRef<HTMLInputElement>;

  countries = toSignal(
    this.countryUtils.getCountriesSortedByName().pipe(
      map(countries => countries.map(({ id, name, label }) => ({ id, name, label })))
    ),
    { initialValue: [] }
  );

  constructor(private readonly fb: FormBuilder, private readonly commonMessageService: CommonMessagesService) {
    this.contractorForm = this.fb.group({
      contractorlabel: ['', [Validators.required]],
      contractorname: [''],
      country: [null],
      street: [''],
      zipcode: [''],
      city: [''],
      taxno: ['']
    });
  }

  ngOnInit(): void {
    this.initFormContractor();

    if (this.modalContractType === 'create') {
      this.getCurrentCustomer();
    }
  }

  ngOnDestroy() {
    if (this.subscription) {
      this.subscription.unsubscribe();
    }
  }

  private getCurrentCustomer(): void {
    this.route.params.subscribe(params => {
      const customerId = params['id'];

      this.subscription.add(
        this.customerUtils.getCustomerById(customerId).subscribe(customer => {
          this.currentCustomer = customer;
        })
      );
    });
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

  hasAtLeastOneFieldFilled(): boolean {
    const formValues = this.contractorForm.value;
    
    return Object.keys(formValues).some(key => {
      const value = formValues[key];
      
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (typeof value === 'number') return value !== 0;
      if (typeof value === 'object') return value !== null;
      
      return false;
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if ((changes['contractor'] || changes['isVisibleModal']) && this.modalContractType === 'edit' && this.contractor) {
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
    if (changes['isVisibleModal'] && !changes['isVisibleModal'].currentValue) {
      this.contractorForm.reset();
    }
  }

  private buildContractor(customerSource: any, countrySource: any): Contractor {
    const formValues = this.contractorForm.value;
    const country = countrySource ? this.buildCountryFromSource(countrySource) : null;

    return {
      id: this.contractor?.id ?? 0,
      version: this.contractor?.version ?? 0,
      createdAt: '',
      updatedAt: '',
      customer: this.buildCustomerFromSource(customerSource),
      country: country,
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
    return selectedCountryId ? this.countries().find(c => c.id === selectedCountryId) : null;
  }

  updateContractor() {
    if (!this.contractor?.id) return;

    this.isLoading = true;
    const updatedContractor = this.buildContractor(
      this.contractor?.customer,
      this.getSelectedCountry()
    );

    this.subscription.add(this.contractorUtils.updateContractor(updatedContractor)
      .subscribe({
      next: (updated) => this.handleUpdateSuccess(updated),
      error: (err) => this.handleUpdateError(err)
    }));
  }

  handleUpdateError(error: Error): void {
    this.isLoading = false;
    this.isContractVisibleModal.emit(false);
    this.commonMessageService.showErrorEditMessage();
    if (error instanceof OccError) {
      this.showOCCErrorModalContractor.emit(true);
      this.occErrorType.emit(error.errorType);
    }
  }

  get isCreateContractorMode(): boolean {
    return this.modalContractType !== 'delete';
  }

  onSubmit() {
    if (!this.hasAtLeastOneFieldFilled()) {
      return;
    }

    if (this.modalContractType === 'create') {
      const newContractor = this.buildContractorFromForm();
      this.createContractor(newContractor);
    } else if (this.modalContractType === 'edit') {
      this.updateContractor();
    }
  }

  private handleUpdateSuccess(updatedContractor: Contractor): void {
    this.isLoading = false;
    this.commonMessageService.showEditSucessfullMessage();
    this.isContractVisibleModal.emit(false);
    this.contractorUpdated.emit(updatedContractor);
  }

  private createContractor(newContractor: Omit<Contractor, 'id'>): void {
    this.isLoading = true;
    this.subscription.add(
      this.contractorUtils.createNewContractor(newContractor).subscribe({
        next: () => {
          this.isLoading = false;
          this.onContractorCreated.emit({ status: 'success' });
          this.commonMessageService.showCreatedSuccesfullMessage();
          this.closeModal();
        },
        error: () => {
          this.isLoading = false;
          this.onContractorCreated.emit({ status: 'error' });
          this.commonMessageService.showErrorCreatedMessage();
        }
      })
    )
  }

  private buildContractorFromForm(): Omit<Contractor, 'id'> {
    const selectedCountryId = this.contractorForm.value.country;
    const country = selectedCountryId ? {
      id: selectedCountryId,
      version: 0,
      createdAt: '',
      updatedAt: '',
      isDefault: false,
      label: '',
      name: ''
    } : null;

    return {
      version: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      city: this.contractorForm.value.city,
      label: this.contractorForm.value.contractorlabel,
      name: this.contractorForm.value.contractorname,
      number: 0,
      street: this.contractorForm.value.street,
      taxNumber: this.contractorForm.value.taxno,
      zipCode: this.contractorForm.value.zipcode,
      country: country,
      customer: this.currentCustomer ?? null
    }
  }

  closeModal(): void {
    this.isContractVisibleModal.emit(false);
    this.contractorForm.reset();
  }

  removeContractor() {
    if (this.contractor) {
      this.isLoadingDelete = true;
      this.contractorUtils.deleteContractor(this.contractor.id).subscribe({
        next: () => {
          this.isLoadingDelete = false;
          this.isContractVisibleModal.emit(false);
          this.onContractorDeleted.emit(this.contractor?.id);
          this.visibleContractorDeleteEntityModal = false;
          this.commonMessageService.showDeleteSucessfullMessage();
        },
        error: (err) => {
          this.isLoadingDelete = false;
          this.closeModal();
          this.handleDeleteError(err);
        }
      })
    }
  }

  private handleDeleteError(error: any) {
    if (error instanceof OccError || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED') {
      this.visibleContractorDeleteEntityModal = false;
      this.showOCCErrorModalContractor.emit(true);
      this.occErrorType.emit('DELETE_UNEXISTED');
      this.commonMessageService.showErrorDeleteMessage();
    }else if(error instanceof HttpErrorResponse && error.status === 500 && error.error.message.includes('foreign key constraint')){
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
    }else{
      this.commonMessageService.showErrorDeleteMessage();
    }
  }
}