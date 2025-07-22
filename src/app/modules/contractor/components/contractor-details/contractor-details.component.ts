import { Component, inject, Input, Output, EventEmitter, OnChanges, SimpleChanges, OnInit, OnDestroy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { map, Subscription } from 'rxjs';
import { CountryUtils } from '../../../master-data/components/countries/utils/country-util';
import { ContractorUtils } from '../../utils/contractor-utils';
import { MessageService } from 'primeng/api';
import { TranslateService } from '@ngx-translate/core';
import { Contractor } from '../../../../Entities/contractor';
import { Customer } from '../../../../Entities/customer';
import { CustomerUtils } from '../../../customer/utils/customer-utils';
import { ActivatedRoute } from '@angular/router';
import { buildCustomer } from '../../../shared/utils/builders/customer';
import { buildCountry } from '../../../shared/utils/builders/country';
import { CommonMessagesService } from '../../../../Services/common-messages.service';

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
  private readonly messageService = inject(MessageService);
  private readonly translate = inject(TranslateService);
  private readonly subscription = new Subscription();

  public contractorForm!: FormGroup;
  public showOCCErrorModalContractor = false;
  private loading = false;
  
  @Input() currentCustomer!: Customer | undefined;
  @Input() contractor: Contractor | null = null;
  @Input() modalContractType: 'create' | 'edit' | 'delete' = 'create';
  @Input() isVisibleModal: boolean = false;
  @Output() isContractVisibleModal = new EventEmitter<boolean>();
  @Output() onMessageOperation = new EventEmitter<{severity: string, summary: string, detail: string}>()
  @Output() contractorUpdated = new EventEmitter<Contractor>();
  @Output() onContractorCreated = new EventEmitter<Contractor>();
  @Output() onContractorDeleted = new EventEmitter<number>();

  countries = toSignal(
    this.countryUtils.getCountriesSortedByName().pipe(
      map(countries => countries.map(({ id, name, label }) => ({ id, name, label })))
    ),
    { initialValue: [] }
  );

  constructor(private readonly fb: FormBuilder, private readonly commonMessageService: CommonMessagesService) {
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
    
    if(this.modalContractType === 'create'){
      this.getCurrentCustomer();
    }
  }

  ngOnDestroy() {
    if(this.subscription){
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

  updateContractor() {
    if (!this.validateContractorForUpdate()) return;
    this.loading = true;

    const updatedContractor = this.buildContractor(
      this.contractor?.customer,
      this.getSelectedCountry()
    );

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
    } else {
      this.commonMessageService.showErrorEditMessage();
    }
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
        this.updateContractor();
      }
    }
  }

  private showError(detail: string): void {
    this.messageService.add({
      severity: 'error',
      summary: this.translate.instant('TITLE.MESSAGE.ERROR'),
      detail
    });
  }

  private handleUpdateSuccess(updatedContractor: Contractor): void {
    this.commonMessageService.showEditSucessfullMessage();
    this.isContractVisibleModal.emit(false);
    this.contractorUpdated.emit(updatedContractor);
  }

  private createContractor(newContractor: Omit<Contractor, 'id'>): void {
    this.subscription.add(
      this.contractorUtils.createNewContractor(newContractor).subscribe({
        next: (resContractor) => {
          this.onContractorCreated.emit(resContractor);
          this.commonMessageService.showCreatedSuccesfullMessage();
          this.closeModal();
        },
        error: (err) => {
          this.commonMessageService.showErrorCreatedMessage();
          this.closeModal();
        }
      })
    )
  }

  private buildContractorFromForm(): Omit<Contractor, 'id'> {
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
      country: {
        id: this.contractorForm.value.country,
        version: 0,
        createdAt: '',
        updatedAt: '',
        isDefault: false,
        label: '',
        name: ''
      },
      customer: this.currentCustomer ?? null
    }
  }

  closeModal(): void {
    this.isContractVisibleModal.emit(false);
  }

  removeContractor() {
    if(this.contractor){
      this.contractorUtils.deleteContractor(this.contractor.id).subscribe({
        next: () => {
          this.isContractVisibleModal.emit(false);
          this.onContractorDeleted.emit(this.contractor?.id);
          this.commonMessageService.showDeleteSucessfullMessage();
        },
        error: (error) => {
          this.commonMessageService.showErrorDeleteMessage();
        }
      })
    }
  }
}
