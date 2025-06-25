import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { TranslateService, _ } from '@ngx-translate/core';

// Entities
import { Customer } from '../../../../Entities/customer';
import { ContactPerson } from '../../../../Entities/contactPerson';
import { UserPreference } from '../../../../Entities/user-preference';

// Services
import { CustomerService } from '../../../../Services/customer.service';
import { CountryService } from '../../../../Services/country.service';
import { ContactPersonService } from '../../../../Services/contact-person.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { CustomerStateService } from '../../utils/customer-state.service';
import { CustomerUtils } from '../../utils/customer-utils';
import { PageTitleService } from '../../../../shared/services/page-title.service';

interface Column {
  field: string;
  header: string;
  minWidth: number;
  filter?: any;
  customClasses?: string[];
}

@Component({
  selector: 'app-list-customers',
  standalone: false,
  templateUrl: './list-customers.component.html',
  styleUrl: './list-customers.component.scss',
})
export class ListCustomersComponent implements OnInit, OnDestroy {
  // Dependencies injection
  private readonly customerService = inject(CustomerService);
  private readonly customerStateService = inject(CustomerStateService);
  private readonly customerUtils = inject(CustomerUtils);
  private readonly countryService = inject(CountryService);
  private readonly contactPersonService = inject(ContactPersonService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pageTitleService = inject(PageTitleService);

  // Table reference
  @ViewChild('dt2') dt2!: Table;

  // Signals & states
  private langSubscription!: Subscription;

  // Data table
  customerData: any[] = [];
  contacts: Record<number, string> = {};

  // Cols configuration
  public cols!: Column[];
  public selectedColumns!: Column[];

  // User Preferences
  userListCustomerPreferences: UserPreference = {};
  tableKey: string = 'ListCustomers';
  dataKeys = ['id', 'companyName', 'nameLine2', 'kind', 'land', 'place', 'contact'];

  // Component States
  public countries!: string[];
  public selectedCountries: any[] = [];
  public companyTypes: string[] = [];
  public isLoadingCustomer = false;
  customerType: 'create' | 'delete' = 'create';
  selectedCustomer: number | null = null;
  customerName: string = '';
  visibleCustomerModal: boolean = false;
  isLoading = false;
  errorMessage: string = '';

  public customers!: Customer[];

  constructor() { }

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.CUSTOMER_OVERVIEW');

    this.loadInitialData();
    this.setupLanguageChangeListener();
  }

  private loadInitialData(): void {
    this.isLoading = true;

    forkJoin([
      this.countryService.getAllCountries(),
      this.contactPersonService.getAllContactPersons(),
      this.customerUtils.getAllCustomers()
    ]).subscribe({
      next: ([countries, contacts, customers]) => {
        this.handleInitialDataSuccess(countries, contacts, customers);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.isLoading = false;
      }
    });
  }

  private handleInitialDataSuccess(
    countries: any[],
    contacts: ContactPerson[],
    customers: Customer[]
  ): void {
    this.countries = countries.map(country => country.name);
    this.companyTypes = ['KMU', 'FuE', 'Unternehmen', 'PT'];
    this.customers = customers;

    this.initializeContactsMap(contacts);
    this.initializeTableData();
    this.initializeTableConfiguration();
  }

  private initializeContactsMap(contacts: ContactPerson[]): void {
    this.contacts = contacts.reduce((acc: Record<number, string>, contact) => {
      if (contact.customer) {
        acc[contact.customer.id] = `${contact.firstName} ${contact.lastName}`;
      }
      return acc;
    }, {});
  }

  private initializeTableData(): void {
    this.customerData = this.customers.map(customer => ({
      id: customer.id,
      companyName: customer.customername1,
      nameLine2: customer.customername2,
      kind: customer.companytype?.name,
      land: customer.country?.name,
      place: customer.city,
      contact: this.contacts[customer.id] ?? '',
    }));

    this.customerService.updateCustomerData(this.customers);
  }

  private initializeTableConfiguration(): void {
    this.loadColHeaders();
    this.selectedColumns = this.cols;
    this.userListCustomerPreferences = this.userPreferenceService.getUserPreferences(
      this.tableKey,
      this.selectedColumns
    );
  }

  private setupLanguageChangeListener(): void {
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = this.cols;
      this.userListCustomerPreferences = this.userPreferenceService.getUserPreferences(
        this.tableKey,
        this.selectedColumns
      );
    });
  }

  onUserListCustomerPreferencesChanges(userListCustomerPreferences: any) {
    localStorage.setItem(
      'userPreferences',
      JSON.stringify(userListCustomerPreferences)
    );
  }

  handleCustomerTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.customerType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedCustomer = event.data;

      this.customerUtils.getCustomerById(this.selectedCustomer!).subscribe({
        next: (customer) => {
          this.customerName = customer?.customername1 ?? '';
        },
        error: (err) => {
          this.customerName = '';
        }
      });
    }
    this.visibleCustomerModal = true;
  }

  loadColHeaders(): void {
    this.cols = [
      {
        field: 'id',
        minWidth: 110,
        customClasses: ['align-right'],
        header: this.translate.instant(_('CUSTOMERS.TABLE.CUSTOMER_ID')),
      },
      {
        field: 'companyName',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_NAME')),
      },
      {
        field: 'nameLine2',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.NAME_LINE_2')),
      },
      {
        field: 'kind',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_TYPE')),
        filter: { type: 'multiple', data: this.companyTypes },
      },

      {
        field: 'land',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.COUNTRY_NAME')),
        filter: { type: 'multiple', data: this.countries },
      },
      {
        field: 'place',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.CITY')),
      },
      {
        field: 'contact',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.CONTACT_PERSON')),
      },
    ];
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  applyFilter(event: Event, field: string) {
    const inputElement = event.target as HTMLInputElement;
    if (inputElement) {
      this.dt2.filter(inputElement.value, field, 'contains');
    }
  }

  filterByCountry() {
    if (this.selectedCountries && this.selectedCountries.length > 0) {
      const countriesNames: string[] = this.selectedCountries.map(
        (country) => country.nameCountry
      );
      this.dt2.filter(countriesNames, 'land', 'in');
    } else {
      this.dt2.filter(null, 'land', 'in');
    }
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => { });
    });
  }

  goToCustomerDetails(currentCustomer: Customer) {
    this.customerUtils.getCustomerById(currentCustomer.id).subscribe({
      next: (fullCustomer) => {
        if (fullCustomer) {
          this.customerStateService.setCustomerToEdit(fullCustomer);
        }
      },
      error: (err) => {
        console.error('Error al cargar el customer para editar:', err);
      }
    });

    this.router.navigate(['customer-details', currentCustomer.id], {
      relativeTo: this.route,
      state: { customer: currentCustomer.id, customerData: currentCustomer },
    });
  }

  goToCustomerOverview(rowData: any, event?: MouseEvent) {
    const url = this.router
      .createUrlTree(['/customers/customer-details', rowData.id])
      .toString();

    window.open(url);
  }

  goToCustomerRegister() {
    this.router.navigate(['customer-create'], { relativeTo: this.route });
  }

  onCustomerDeleteConfirm() {
    this.isLoadingCustomer = true;

    if (this.selectedCustomer) {
      this.customerUtils.deleteCustomer(this.selectedCustomer).subscribe({
        next: () => {
          this.isLoadingCustomer = false;
          this.visibleCustomerModal = false;
          this.customerData = this.customerData.filter(c => c.id !== this.selectedCustomer);
          this.customers = this.customers.filter(c => c.id !== this.selectedCustomer);
        },
        error: (error) => {
          this.isLoadingCustomer = false;
          this.errorMessage = error.message ?? 'Failed to delete customer';
          console.error('Delete error:', error);
        }
      });
    }
  }

}
