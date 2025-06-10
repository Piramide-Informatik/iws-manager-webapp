import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../services/customer.service';
import { Subscription, map } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { CountryService } from '../../../../Services/country.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BranchService } from '../../../../Services/branch.service';
import { ContactPersonService } from '../../../../Services/contact-person.service';
import { CompanyTypeService } from '../../../../Services/company-type.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { ContactPerson } from '../../../../Entities/contactPerson';

interface Column {
  field: string,
  header: string
  customClasses?: string[]
}

@Component({
  selector: 'app-detail-customer',
  standalone: false,
  templateUrl: './detail-customer.component.html',
  styleUrl: './detail-customer.component.scss'
})
export class DetailCustomerComponent implements OnInit, OnDestroy {

  public selectedCountry!: string;
  public cols!: Column[];
  public selectedColumns!: Column[];
  public customers!: Customer[];
  private langSubscription!: Subscription;
  private readonly countryService = inject(CountryService);
  countries = toSignal(this.countryService.getAllCountries(), { initialValue: [] });
  userDetailCustomerPreferences: UserPreference = {};
  tableKey: string = 'ContactPerson'
  dataKeys = ['name', 'function', 'right'];
  public modalType: 'create' | 'delete' | 'edit' = 'create';
  public contactPersonToDelete!: ContactPerson | undefined;

  private readonly branchService = inject(BranchService);
  private readonly companyTypeService = inject(CompanyTypeService);
  private readonly contactPersonService = inject(ContactPersonService);

  public companyTypes = toSignal(
    this.companyTypeService.getAllCompanyTypes().pipe(
      map(companyTypes => companyTypes.map(compayType => ({
        name: compayType.name,
        code: compayType.id.toString()
      })))
    ),
    { initialValue: [] }
  );

  public sectors = toSignal(
    this.branchService.getAllBranches().pipe(
      map(branches => branches.map(branch => ({
        name: branch.name,
        code: branch.id.toString()
      })))
    ),
    { initialValue: [] }
  );

  public states: any[] = [
    { name: 'Bavaria', code: 'BY' },
    { name: 'Saxony', code: 'SN' },
    { name: 'Saarland', code: 'SL' }
  ]

  public formDetailCustomer!: FormGroup;

  public readonly contactPersons = computed(()=> {
    return this.contactPersonService.contactPersons().map(contact => ({
      id: contact.id,
      name: `${contact.firstName} ${contact.lastName}`,
      function: contact.function ?? '',
      right: contact.forInvoincing
    }))
  });

  constructor(
    private readonly fb: FormBuilder,
    private readonly activatedRoute: ActivatedRoute,
    private readonly customerService: CustomerService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly translate: TranslateService 
  ) {

    this.formDetailCustomer = this.fb.group({
      customerNo: [123],
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
      weekWorkingHours: [''],
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
    this.customers = this.customerService.getCustomers();

    this.selectedCountry = (history.state.customerData.land);
    this.activatedRoute.params
      .subscribe(params => {
        this.formDetailCustomer.get('customerNo')?.setValue(history.state.customerData.id) ;
        this.formDetailCustomer.get('companyText1')?.setValue(history.state.customerData.companyName) ;
        this.formDetailCustomer.get('companyText2')?.setValue(history.state.customerData.nameLine2) ;
        this.formDetailCustomer.get('selectedCountry')?.setValue(this.countries()?.at(1));
        this.formDetailCustomer.get('selectedTypeCompany')?.setValue(history.state.customerData.kind) ;
        this.formDetailCustomer.get('city')?.setValue(history.state.customerData.place) ;
        this.formDetailCustomer.get('invoiceEmail')?.setValue(history.state.customerData.contact) ;
      })

    //Init colums
    this.cols = [
      { field: 'name', header: 'Name' },
      { field: 'function', header: 'Funktion' },
      { field: 'right', header: 'Rech' },
    ];

    this.selectedColumns = this.cols;
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
      { field: 'name', header: 'Name' },
      { field: 'function', header: 'Funktion' },
      { field: 'right', header: 'Rech' },
    ];

    this.cols = [
      {
        field: 'name',
        header: this.translate.instant(_('CUSTOMERS.CONTACT_TABLE.NAME'))
      },
      {
        field: 'function',
        header: this.translate.instant(_('CUSTOMERS.CONTACT_TABLE.FUNCTION'))
      },
      {
        field: 'right',
        customClasses: ['align-right'],
        header: this.translate.instant(_('CUSTOMERS.CONTACT_TABLE.LAW'))
      }
    ];
  }

  ngOnDestroy() : void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  deletePerson(contactId: number) {
    this.modalType = 'delete';
    this.visible = true;
    this.contactPersonToDelete = this.contactPersonService.contactPersons().find(contact => contact.id === contactId);
  }

  editPerson(person: ContactPerson) {
    this.modalType = 'edit';
    this.visible = true;
  }

  createPerson(){
    this.modalType = 'create';
    this.visible = true;
  }

  closeVisibility(visibility: boolean): void {
    this.visible = visibility;
  }
}
