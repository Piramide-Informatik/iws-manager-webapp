import { Component, OnInit, OnDestroy, inject, computed, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../../../Entities/customer.model';
import { CustomerService } from '../../../../Services/customer.service';
import { Subscription, map } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ContactPersonService } from '../../../../Services/contact-person.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { ContactPerson } from '../../../../Entities/contactPerson';
import { ContactStateService } from '../../utils/contact-state.service';
import { CustomerUtils } from '../../utils/customer-utils';
import { StateUtils } from '../../../master-data/components/states/utils/state-utils';
import { CountryUtils } from '../../../master-data/components/countries/utils/country-util';
import { CompanyTypeUtils } from '../../../master-data/components/types-of-companies/utils/type-of-companies.utils';
import { BranchUtils } from '../../utils/branch-utils';
import { MessageService } from 'primeng/api';
interface Column {
  field: string,
  header: string
  customClasses?: string[]
  styles?: {},
  filter?: { type: 'boolean' | 'multiple' }
}

@Component({
  selector: 'app-detail-customer',
  standalone: false,
  templateUrl: './detail-customer.component.html',
  styleUrl: './detail-customer.component.scss'
})
export class DetailCustomerComponent implements OnInit, OnDestroy {


  public selectedCountry!: string;
  public selectedTypeCompany!: string;
  public cols!: Column[];
  public selectedColumns!: Column[];
  public customers!: Customer[];
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
  public currentContactPerson!: ContactPerson | null; // Para editarlo o eliminarlo 

  private readonly companyTypeUtils = inject(CompanyTypeUtils);
  private readonly contactPersonService = inject(ContactPersonService);
  private readonly stateUtils = inject(StateUtils);

  public contactPersons = signal<ContactPerson[]>([]);
  public loadingContacts = signal<boolean>(false);
  public errorContacts = signal<string | null>(null);

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
    return this.contactPersons().map(contact => ({
      id: contact.id,
      name: `${contact.firstName} ${contact.lastName}`,
      function: contact.function ?? '',
      right: contact.forInvoicing
    }));
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly customerService: CustomerService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly contactStateService: ContactStateService,
    private customerUtils: CustomerUtils,
    private readonly messageService: MessageService 
  ) {
    this.formDetailCustomer = this.fb.group({
      customerNo: [],
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
      this.userDetailCustomerPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
    this.formDetailCustomer.get('customerNo')?.disable();

    this.activatedRoute.params.subscribe(params => {
      this.customerId = params['id'];

      this.customerService.getCustomerById(Number(this.customerId)).subscribe(customer => {
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
        this.formDetailCustomer.patchValue(formData);
        this.formDetailCustomer.updateValueAndValidity();
      });

      this.loadCustomerContacts(this.customerId);

      console.log(this.contactPersons);
    });
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

  onUserCustomerDetailPreferencesChanges(userCustomerDetailPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userCustomerDetailPreferences));
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
  }

  deletePerson(contactId: number) {
    this.modalType = 'delete';
    this.visible = true;
    this.currentContactPerson = this.contactPersonService.contactPersons().find(contact => contact.id === contactId) ?? null;
  }

  editPerson(person: ContactPerson) {
    this.modalType = 'edit';
    this.visible = true;
    this.currentContactPerson = this.contactPersonService.contactPersons().find(contact => contact.id === person.id) ?? null;
    this.contactStateService.setCountryToEdit(this.currentContactPerson);
  }

  createPerson() {
    this.modalType = 'create';
    this.currentContactPerson = null;
    this.visible = true;
    this.contactStateService.setCountryToEdit(null);
  }

  closeVisibility(visibility: boolean): void {
    this.visible = visibility;
  }
  createCustomer() {
    if (this.formDetailCustomer.invalid) {
        console.error('Form is invalid');
        return;
    }

    const formValues = this.formDetailCustomer.value;

    const newCustomer: Omit<Customer, 'id'> = {
        city: formValues.city,
        companytype: formValues.selectedTypeCompany
            ? { id: formValues.selectedTypeCompany, name: '', createdAt: '', updatedAt: '', version: 0 }
            : null,
        branch: formValues.selectedSector
            ? { id: formValues.selectedSector, name: '', version: 0 }
            : null,
        country: formValues.selectedCountry
            ? { id: formValues.selectedCountry, version: 0, name: '', label: '', isDefault: false, createdAt: '', updatedAt: '' }
            : null,
        customerno: formValues.customerNo,
        customername1: formValues.companyText1,
        customername2: formValues.companyText2,
        email1: formValues.invoiceEmail,
        email2: null,
        email3: null,
        email4: null,
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

    this.customerUtils.createNewCustomer(newCustomer).subscribe({
        next: () => {
            this.messageService.add({
                severity: 'success',
                summary: this.translate.instant('CUSTOMERS.MESSAGE.SUCCESS'),
                detail: this.translate.instant('CUSTOMERS.MESSAGE.CREATE_SUCCESS')
            });
            this.clearForm(); // Limpia el formulario después de crear el cliente
        },
        error: (err) => {
            console.error('Error creating customer:', err);
            this.messageService.add({
                severity: 'error',
                summary: this.translate.instant('CUSTOMERS.MESSAGE.ERROR'),
                detail: this.translate.instant('CUSTOMERS.MESSAGE.CREATE_FAILED')
            });
        }
    });
}

  clearForm(): void {
    this.formDetailCustomer.reset(); // Limpia el formulario
  }
}
