import { Component, OnInit, OnDestroy, inject, computed } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../../../Services/customer.service';
import { Subscription, map } from 'rxjs';
import { TranslateService, _ } from '@ngx-translate/core';
import { CountryService } from '../../../../Services/country.service';
import { toSignal } from '@angular/core/rxjs-interop';
import { BranchService } from '../../../../Services/branch.service';
import { ContactPersonService } from '../../../../Services/contact-person.service';
import { CompanyTypeService } from '../../../../Services/company-type.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { CustomerUtils } from '../../utils/customer-utils';

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

  private readonly customerUtils = new CustomerUtils();
  public selectedCountry!: string;
  public selectedTypeCompany!: string;
  public cols!: Column[];
  public selectedColumns!: Column[];
  public customers!: Customer[];
  private langSubscription!: Subscription;
  customerId!: number;
  private readonly countryService = inject(CountryService);
  countries = toSignal(this.countryService.getAllCountries(), { initialValue: [] });
  userDetailCustomerPreferences: UserPreference = {};
  tableKey: string = 'ContactPerson'
  dataKeys = ['name', 'function', 'right'];
  

  private readonly branchService = inject(BranchService);
  private readonly companyTypeService = inject(CompanyTypeService);
  private readonly contactPersonService = inject(ContactPersonService);

  public companyTypes = toSignal(
    this.companyTypeService.getAllCompanyTypes().pipe(
      map(companyTypes => companyTypes.map(compayType => ({
        name: compayType.name,
        id: compayType.id
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
      name: `${contact.firstName} ${contact.lastName}`,
      function: contact.function ?? '',
      right: contact.forInvoicing
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

    this.activatedRoute.params
      .subscribe(params => {
        this.customerId = params['id']; 
        this.customerService.getCustomerById(Number(this.customerId)).subscribe(customer => {
          const formData = {
            id: customer?.id,
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
          }
          this.formDetailCustomer.patchValue(formData);
          this.formDetailCustomer.updateValueAndValidity();
        })
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

  deletePerson(contact: any) {
    this.contactPersonService.deleteContactPerson(contact.id);
  }

  showDialog() {
    this.visible = true;
  }

}
