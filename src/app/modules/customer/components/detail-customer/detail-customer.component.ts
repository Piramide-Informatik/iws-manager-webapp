import { Component, OnInit, OnDestroy, inject, computed, signal, ViewChild, ElementRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, map } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { ContactPerson } from '../../../../Entities/contactPerson';
import { ContactStateService } from '../../utils/contact-state.service';
import { CustomerUtils } from '../../utils/customer-utils';
import { StateUtils } from '../../../master-data/components/states/utils/state-utils';
import { CountryUtils } from '../../../master-data/components/countries/utils/country-util';
import { CompanyTypeUtils } from '../../../master-data/components/types-of-companies/utils/type-of-companies.utils';
import { BranchUtils } from '../../utils/branch-utils';
import { CustomerStateService } from '../../utils/customer-state.service';
import { Customer } from '../../../../Entities/customer';
import { MessageService } from 'primeng/api';
import { Title } from '@angular/platform-browser';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { Column } from '../../../../Entities/column';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-detail-customer',
  standalone: false,
  templateUrl: './detail-customer.component.html',
  styleUrl: './detail-customer.component.scss',
  providers: [MessageService]
})
export class DetailCustomerComponent implements OnInit, OnDestroy {
  public showDeleteCustomerModal = false;
  public isLoadingCustomer = false;
  public errorMessage: string = '';
  public closeDialog = false;

  private readonly customerStateService = inject(CustomerStateService);
  public currentCustomerToEdit: Customer | null = null;
  private readonly subscriptions = new Subscription();
  public isSaving = false;
  public selectedCountry!: string;
  public selectedTypeCompany!: string;
  public cols!: Column[];
  public selectedColumns!: Column[];
  private langSubscription!: Subscription;
  customerId!: number;
  private readonly branchUtils = inject(BranchUtils);
  private readonly countryUtils = inject(CountryUtils);
  countries = toSignal(
    this.countryUtils.getCountriesSortedByName().pipe(
      map(countries => countries.map(country => ({
        id: country.id,
        name: country.name
      })))
    )
  );
  userDetailCustomerPreferences: UserPreference = {};
  tableKey: string = 'ContactPerson'
  dataKeys = ['name', 'function', 'right'];
  public modalType: 'create' | 'delete' | 'edit' = 'create';
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public currentContactPerson!: ContactPerson | null; // Para editarlo o eliminarlo 

  private readonly companyTypeUtils = inject(CompanyTypeUtils);
  private readonly stateUtils = inject(StateUtils);

  public contactPersons = signal<ContactPerson[]>([]);
  public loadingContacts = signal<boolean>(false);
  public errorContacts = signal<string | null>(null);
  public showOCCModalCustomer = false;

  public companyTypes = toSignal(
    this.companyTypeUtils.getCompanyTypeSortedByName().pipe(
      map(companyTypes => companyTypes.map(compayType => ({
        name: compayType.name,
        id: compayType.id
      })))
    ),
    { initialValue: [] }
  );

  public sectors = toSignal(
    this.branchUtils.getBranchesSortedByName().pipe(
      map(branches => branches.map(branch => ({
        name: branch.name,
        code: branch.id
      })))
    ),
    { initialValue: [] }
  );

  public states = toSignal(
    this.stateUtils.getStatesSortedByName().pipe(
      map(states => states.map(state => ({
        id: state.id,
        name: state.name
      })))
    )
  );

  public formDetailCustomer!: FormGroup;

  public readonly tableData = computed(() => {
    return this.contactPersons()
      .map(contact => ({
        id: contact.id,
        name: `${contact.lastName} ${contact.firstName}`,
        function: contact.function ?? '',
        right: contact.forInvoicing
      }));
  });

  @ViewChild('inputText') firstInput!: ElementRef;

  constructor(
    private readonly fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly contactStateService: ContactStateService,
    private readonly customerUtils: CustomerUtils,
    private readonly titleService: Title,
    private readonly commonMessageService: CommonMessagesService
  ) {
    this.formDetailCustomer = this.fb.group({
      customerNo: [null],
      companyText1: [''],
      companyText2: [''],
      selectedCountry: [''],
      street: [''],
      postalCode: [''],
      city: [''],
      selectedTypeCompany: [''],
      selectedSector: [''],
      selectedState: [''],
      homepage: [''],
      phone: [''],
      invoiceEmail: [''],
      weekWorkingHours: ['', [Validators.min(0), Validators.max(99999.99), Validators.pattern(/^\d{1,5}(\.\d{1,2})?$/)]],
      taxNumber: [''],
      headcount: [''],
      maxHoursMonth: [''],
      maxHoursYear: [''],
      textAreaComment: [''],
    });
  }

  visible: boolean = false;

  ngOnInit(): void {
    this.updateHeadersAndColumns();
    this.userDetailCustomerPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.updateHeadersAndColumns();
      this.loadColumnHeaders();
      this.selectedColumns = this.cols;
      this.userDetailCustomerPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
    this.formDetailCustomer.get('customerNo')?.disable();
    this.loadNextCustomerNo();
    this.firstInputFocus();
    this.setupCustomerSubscription();

    this.activatedRoute.params.subscribe(params => {
      this.customerId = params['id'];

      // Si no hay ID, estamos en modo create
      if (!this.customerId) {
        this.customerStateService.clearCustomer();
        this.clearForm();
        this.updateTitle(this.translate.instant('PAGETITLE.NEW_CUSTOMER'));
        this.contactPersons.set([]);
        return;
      }
      this.updateTitle(' ...');
      // Si hay ID, cargar el customer existente
      this.customerUtils.getCustomerById(Number(this.customerId)).subscribe({
        next: (customer) => {
          if (customer) {
            const formData = {
              customerNo: customer?.customerno,
              companyText1: customer?.customername1,
              companyText2: customer?.customername2,
              selectedCountry: customer?.country?.id,
              street: customer?.street,
              postalCode: customer?.zipcode,
              city: customer?.city,
              selectedTypeCompany: customer?.companytype?.id,
              selectedState: customer?.state?.id,
              homepage: customer?.homepage,
              phone: customer?.phone,
              weekWorkingHours: customer?.hoursperweek,
              taxNumber: customer?.taxno,
              maxHoursMonth: customer?.maxhoursmonth,
              maxHoursYear: customer?.maxhoursyear,
              textAreaComment: customer?.note,
              invoiceEmail: customer?.email1,
              headcount: customer?.taxoffice,
              selectedSector: customer?.branch?.id
            }
            this.updateTitle(customer.customername1!);
            this.langSubscription = this.translate.onLangChange.subscribe(() => {
              this.updateTitle(customer.customername1!);
            });
            this.formDetailCustomer.patchValue(formData);
            this.formDetailCustomer.updateValueAndValidity();
            this.customerStateService.setCustomerToEdit(customer);
            this.loadCustomerContacts(this.customerId);
          }
        },
        error: (error) => {
          console.error('Error loading customer:', error);
          this.customerStateService.clearCustomer();
          this.clearForm();
        }
      });
    });
  }

  private firstInputFocus(): void {
    setTimeout(() => {
      if (this.firstInput.nativeElement) {
        this.firstInput.nativeElement.focus();
      }
    }, 300)
  }

  private updateTitle(name: string): void {
    this.titleService.setTitle(
      `${this.translate.instant('PAGETITLE.CUSTOMER')} ${name} ${this.translate.instant('PAGETITLE.CUSTOMERS.DETAILS')}`
    );
  }

  private loadCustomerContacts(customerId: number): void {
    this.loadingContacts.set(true);
    this.errorContacts.set(null);

    this.customerUtils.getContactsByCustomerId(customerId).subscribe({
      next: (contacts) => {
        this.contactPersons.set(contacts);
        this.loadingContacts.set(false);
      },
      error: (err) => {
        this.errorContacts.set(err.message ?? 'Failed to load contacts');
        this.loadingContacts.set(false);
      }
    });
  }

  onUserCustomerDetailPreferencesChanges(userDetailCustomerPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userDetailCustomerPreferences));
  }

  updateHeadersAndColumns() {
    this.loadColumnHeaders();
    this.selectedColumns = [...this.cols];
  }

  loadColumnHeaders(): void {
    this.cols = [
      {
        field: 'name',
        header: this.translate.instant(_('CUSTOMERS.CONTACT_TABLE.NAME')),
        styles: { width: 'fit-content' },
        useSameAsEdit: true
      },
      {
        field: 'function',
        header: this.translate.instant(_('CUSTOMERS.CONTACT_TABLE.FUNCTION'))
      },
      {
        field: 'right',
        header: this.translate.instant(_('CUSTOMERS.CONTACT_TABLE.LAW')),
        filter: {
          type: 'boolean'
        },
        styles: { width: 'auto' },
      }
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
    this.subscriptions.unsubscribe();
  }

  private setupCustomerSubscription(): void {
    this.subscriptions.add(
      this.customerStateService.currentCustomer$.subscribe(customer => {
        this.currentCustomerToEdit = customer;
        if (this.customerId && customer) {
          this.loadCustomerFormData(customer);
        } else if (!this.customerId && !customer) {
          this.clearForm();
        }
      })
    );
  }

  private loadCustomerFormData(customer: Customer): void {
    this.formDetailCustomer.patchValue({
      customerNo: customer.customerno,
      companyText1: customer.customername1,
      companyText2: customer.customername2,
      selectedCountry: customer.country?.id,
      street: customer.street,
      postalCode: customer.zipcode,
      city: customer.city,
      selectedTypeCompany: customer.companytype?.id,
      selectedState: customer.state?.id,
      homepage: customer.homepage,
      phone: customer.phone,
      weekWorkingHours: customer.hoursperweek,
      taxNumber: customer.taxno,
      maxHoursMonth: customer.maxhoursmonth,
      maxHoursYear: customer.maxhoursyear,
      textAreaComment: customer.note,
      invoiceEmail: customer.email1,
      headcount: customer.taxoffice,
      selectedSector: customer.branch?.id
    });
    this.formDetailCustomer.updateValueAndValidity();
  }

  clearForm(): void {
    this.formDetailCustomer.reset();
    this.currentCustomerToEdit = null;
    this.isSaving = false;
  }

  onSubmit(): void {
    if (this.shouldPreventSubmission()) {
      this.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const updatedCustomer = this.buildUpdatedCustomer();

    this.updateCustomer(updatedCustomer);
  }

  private buildUpdatedCustomer(): Customer {
    const formValue = this.formDetailCustomer.value;

    return {
      ...this.currentCustomerToEdit!,
      customerno: this.formDetailCustomer.getRawValue().customerNo,
      customername1: formValue.companyText1,
      customername2: formValue.companyText2,
      country: this.buildCountryEntity(formValue.selectedCountry),
      street: formValue.street,
      zipcode: formValue.postalCode,
      city: formValue.city,
      companytype: this.buildCompanyTypeEntity(formValue.selectedTypeCompany),
      state: this.buildStateEntity(formValue.selectedState),
      homepage: formValue.homepage,
      phone: formValue.phone,
      hoursperweek: formValue.weekWorkingHours,
      taxno: formValue.taxNumber,
      maxhoursmonth: formValue.maxHoursMonth,
      maxhoursyear: formValue.maxHoursYear,
      note: formValue.textAreaComment,
      email1: formValue.invoiceEmail,
      taxoffice: formValue.headcount,
      branch: this.buildBranchEntity(formValue.selectedSector)
    };
  }

  private buildCountryEntity(countryId?: number): Customer['country'] {
    if (!countryId) return null;

    return {
      id: countryId,
      name: '',
      label: '',
      isDefault: false,
      createdAt: '',
      updatedAt: '',
      version: 0
    };
  }

  private buildCompanyTypeEntity(companyTypeId?: number): Customer['companytype'] {
    if (!companyTypeId) return null;

    return {
      id: companyTypeId,
      name: '',
      createdAt: '',
      updatedAt: '',
      version: 0
    };
  }

  private buildStateEntity(stateId?: number): Customer['state'] {
    if (!stateId) return null;

    return {
      id: stateId,
      name: '',
      createdAt: '',
      updatedAt: '',
      version: 0
    };
  }

  private buildBranchEntity(branchId?: number): Customer['branch'] {
    if (!branchId) return null;

    return {
      id: branchId,
      name: '',
      version: 0,
      updatedAt: '',
      createdAt: ''
    };
  }

  private updateCustomer(customer: Customer): void {
    const updateSub = this.customerUtils.updateCustomer(customer)
      .subscribe({
        next: (savedCustomer) => this.handleSaveSuccess(savedCustomer),
        error: (err) => this.handleSaveError(err)
      });

    this.subscriptions.add(updateSub);
  }

  private handleSaveSuccess(savedCustomer: Customer): void {
    this.formDetailCustomer.markAsPristine();
    this.formDetailCustomer.markAsUntouched();
    this.commonMessageService.showEditSucessfullMessage();
    this.customerStateService.setCustomerToEdit(savedCustomer);
    this.isSaving = false;
  }

  private handleSaveError(error: any): void {
    this.isSaving = false;

    if (error instanceof OccError) {
      this.showOCCModalCustomer = true;
      this.occErrorType = error.errorType;
    }

    this.commonMessageService.showErrorEditMessage();
  }


  private shouldPreventSubmission(): boolean {
    return this.formDetailCustomer.invalid ||
      !this.currentCustomerToEdit ||
      this.isSaving;
  }

  private markAllAsTouched(): void {
    Object.values(this.formDetailCustomer.controls).forEach(control => {
      control.markAsTouched();
      control.markAsDirty();
    });
  }

  // Operations with Contact Person
  deletePerson(contactId: number) {
    this.modalType = 'delete';
    this.visible = true;
    this.currentContactPerson = this.contactPersons().find(contact => contact.id === contactId) ?? null;
    this.contactStateService.setContactToEdit(this.currentContactPerson);
  }

  editPerson(person: ContactPerson) {
    this.modalType = 'edit';
    this.visible = true;
    this.currentContactPerson = this.contactPersons().find(contact => contact.id === person.id) ?? null;
    this.contactStateService.setContactToEdit(this.currentContactPerson);
  }

  createPerson() {
    this.modalType = 'create';
    this.currentContactPerson = null;
    this.visible = true;
    this.contactStateService.setContactToEdit(null);
  }

  updateContactList(customerId: number) {
    this.loadCustomerContacts(customerId);
  }

  closeVisibility(visibility: boolean): void {
    this.visible = visibility;
  }
  createCustomer() {
    if (this.formDetailCustomer.invalid) return;

    this.isSaving = true;
    const newCustomer = this.buildCustomerFromForm();

    this.subscriptions.add(
      this.customerUtils.createNewCustomer(newCustomer).subscribe({
        next: (customer) => this.handleSuccess(customer),
        error: (err) => this.handleError(err)
      })
    )
  }

  private buildCustomerFromForm(): Omit<Customer, 'id' | 'createdAt' | 'updatedAt' | 'version'> {
    const formValues = this.formDetailCustomer.value;

    return {
      city: formValues.city,
      companytype: formValues.selectedTypeCompany
        ? { id: formValues.selectedTypeCompany, name: '', createdAt: '', updatedAt: '', version: 0 }
        : null,
      branch: formValues.selectedSector
        ? { id: formValues.selectedSector, name: '', version: 0, createdAt: '', updatedAt: '' }
        : null,
      country: formValues.selectedCountry
        ? { id: formValues.selectedCountry, version: 0, name: '', label: '', isDefault: false, createdAt: '', updatedAt: '' }
        : null,
      customerno: this.formDetailCustomer.getRawValue().customerNo,
      customername1: formValues.companyText1,
      customername2: formValues.companyText2,
      email1: formValues.invoiceEmail,
      homepage: formValues.homepage,
      hoursperweek: formValues.weekWorkingHours?.toString(),
      maxhoursmonth: formValues.maxHoursMonth?.toString(),
      maxhoursyear: formValues.maxHoursYear?.toString(),
      note: formValues.textAreaComment,
      phone: formValues.phone,
      state: formValues.selectedState
        ? { id: formValues.selectedState, name: '', createdAt: '', updatedAt: '', version: 0 }
        : null,
      street: formValues.street,
      taxno: formValues.taxNumber,
      taxoffice: formValues.headcount,
      zipcode: formValues.postalCode
    };
  }

  private handleSuccess(customer: Customer): void {
    this.isSaving = false;
    this.commonMessageService.showCreatedSuccesfullMessage();
    this.clearForm();
    this.customerStateService.setCustomerToEdit(customer);
    this.router.navigate(['../customer-details', customer.id], { relativeTo: this.activatedRoute });
  }

  private handleError(err: any): void {
    this.isSaving = false;
    console.error('Error creating customer:', err);
    this.commonMessageService.showErrorCreatedMessage();
  }

  onCustomerDeleteConfirm() {
    this.isLoadingCustomer = true;
    if (this.customerId) {
      this.customerUtils.deleteCustomer(this.customerId).subscribe({
        next: () => {
          this.isLoadingCustomer = false;
          this.showDeleteCustomerModal = false;
          this.commonMessageService.showDeleteSucessfullMessage();
          this.router.navigate(['/customers']);
        },
        error: (error) => {
          this.isLoadingCustomer = false;
          this.showDeleteCustomerModal = false;
          this.handleErrorDelete(error);
        }
      });
    }
  }

  private loadNextCustomerNo(): void {
    const sub = this.customerUtils.getNextCustomerNumber().subscribe({
      next: (nextNo) => {
        if (nextNo != null) {
          this.formDetailCustomer.patchValue({ customerNo: nextNo });
        }
      },
      error: (err) => console.error('Error loading next customerNo', err),
    });
    this.subscriptions.add(sub);
  }
  
  private handleErrorDelete(error: any): void {
    if (error instanceof OccError || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED') {
      this.showOCCModalCustomer = true;
      this.occErrorType = 'DELETE_UNEXISTED';
      this.commonMessageService.showErrorDeleteMessage();
    } else if (error instanceof HttpErrorResponse && error.status === 500 && error.error.message.includes('foreign key constraint')){
      this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
    } else {
      this.commonMessageService.showErrorDeleteMessage();
    }
  }
}
