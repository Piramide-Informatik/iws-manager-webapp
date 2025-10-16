import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { forkJoin, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Table } from 'primeng/table';
import { TranslateService, _ } from '@ngx-translate/core';

// Entities
import { Customer } from '../../../../Entities/customer';
import { ContactPerson } from '../../../../Entities/contactPerson';
import { UserPreference } from '../../../../Entities/user-preference';
import { Country } from '../../../../Entities/country';
import { CompanyType } from '../../../../Entities/companyType';
import { Column } from '../../../../Entities/column';

// Services
import { CustomerService } from '../../../../Services/customer.service';
import { ContactPersonService } from '../../../../Services/contact-person.service';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { CustomerStateService } from '../../utils/customer-state.service';
import { CustomerUtils } from '../../utils/customer-utils';
import { PageTitleService } from '../../../../shared/services/page-title.service';
import { CompanyTypeUtils } from '../../../master-data/components/types-of-companies/utils/type-of-companies.utils';
import { CountryUtils } from '../../../master-data/components/countries/utils/country-util';
import { CommonMessagesService } from '../../../../Services/common-messages.service';
import { HttpErrorResponse } from '@angular/common/http';
import { OccError, OccErrorType } from '../../../shared/utils/occ-error';

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
  private readonly countryUtils = inject(CountryUtils);
  private readonly contactPersonService = inject(ContactPersonService);
  private readonly userPreferenceService = inject(UserPreferenceService);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly pageTitleService = inject(PageTitleService);
  private readonly companyTypeUtils = inject(CompanyTypeUtils);

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
  dataKeys = ['customerno', 'customername1', 'customername2', 'companytype', 'country', 'city', 'contact'];

  // Component States
  public countries!: any[];
  public companyTypes: any[] = [];
  public isLoadingCustomer = false;
  customerType: 'create' | 'delete' = 'create';
  selectedCustomer: number | null = null;
  customerName: string = '';
  visibleCustomerModal: boolean = false;
  isLoading = false;
  errorMessage: string = '';
  showOCCErrorModalCustomer = false;
  public occErrorType: OccErrorType = 'UPDATE_UNEXISTED';
  public customers!: Customer[];

  constructor(private readonly commonMessageService: CommonMessagesService) { }

  ngOnInit(): void {
    this.pageTitleService.setTranslatedTitle('PAGETITLE.CUSTOMER_OVERVIEW');

    this.loadInitialData();
    this.setupLanguageChangeListener();
  }

  private loadInitialData(): void {
    this.isLoading = true;

    forkJoin([
      this.countryUtils.getCountriesSortedByName(),
      this.contactPersonService.getAllContactPersons(),
      this.customerUtils.getAllCustomers(),
      this.companyTypeUtils.getCompanyTypeSortedByName() 
    ]).subscribe({
      next: ([countries, contacts, customers, companyTypes]) => {
        this.handleInitialDataSuccess(countries, contacts, customers, companyTypes);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading initial data:', error);
        this.isLoading = false;
      }
    });
  }

  private handleInitialDataSuccess(
    countries: Country[],
    contacts: ContactPerson[],
    customers: Customer[],
    companyTypes: CompanyType[]
  ): void {
    const noneLabel = this.translate.instant(('FILTER.OPTIONS.SELECT_NONE'));
    
    // Crear arrays con objetos que tienen label y value
    this.countries = [
      { label: noneLabel, value: '' },
      ...countries.map(country => ({ label: country.name, value: country.name }))
    ];
    
    this.companyTypes = [
      { label: noneLabel, value: '' },
      ...companyTypes.map(companyType => ({ label: companyType.name, value: companyType.name }))
    ];
    
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
      customerno: customer.customerno,
      customername1: customer.customername1,
      customername2: customer.customername2,
      companytype: customer.companytype,
      country: customer.country,
      city: customer.city,
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
      this.updateFiltersLabels();
      this.loadColHeaders();
      this.selectedColumns = this.cols;
      this.userListCustomerPreferences = this.userPreferenceService.getUserPreferences(
        this.tableKey,
        this.selectedColumns
      );
    });
  }

  private updateFiltersLabels(): void {
    const noneLabel = this.translate.instant('FILTER.OPTIONS.SELECT_NONE');
    this.countries = this.updateFilterOptions(this.countries, noneLabel);
    this.companyTypes = this.updateFilterOptions(this.companyTypes, noneLabel);
  }

  private updateFilterOptions(options: any[], newNoneLabel: string): any[] {
    return [
      { label: newNoneLabel, value: '' },
      ...options.slice(1)
    ];
  }

  onUserListCustomerPreferencesChanges(userListCustomerPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userListCustomerPreferences));
  }

  handleCustomerTableEvents(event: { type: 'create' | 'delete', data?: any }): void {
    this.customerType = event.type;
    if (event.type === 'delete' && event.data) {
      this.selectedCustomer = event.data;

      this.customerName = this.customers.find(customer => customer.id === this.selectedCustomer)?.customername1 ?? '';
    }
    this.visibleCustomerModal = true;
  }

  loadColHeaders(): void {
    this.cols = [
      {
        field: 'customerno',
        classesTHead: ['fix-width'],
        customClasses: ['align-right','date-font-style'],
        header: this.translate.instant(_('CUSTOMERS.TABLE.CUSTOMER_ID')),
      },
      {
        field: 'customername1',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_NAME')),
        routerLink: (row: any) => `./customer-details/${row.id}`
      },
      {
        field: 'customername2',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.NAME_LINE_2')),
      },
      {
        field: 'companytype.name',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_TYPE')),
        filter: { type: 'multiple', data: this.companyTypes },
      },

      {
        field: 'country.name',
        minWidth: 110,
        header: this.translate.instant(_('CUSTOMERS.TABLE.COUNTRY_NAME')),
        filter: { type: 'multiple', data: this.countries },
      },
      {
        field: 'city',
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

  goToCustomerDetails(currentCustomer: {
    id: number;
    customerno: number | undefined;
    customername1: string | undefined;
    customername2: string | undefined;
    companytype: CompanyType | null;
    country: Country | null;
    city: string | undefined;
    contact: string;
  }) {
    const fullCustomer = this.customers.find(customer => customer.id === currentCustomer.id) ?? null;
    this.customerStateService.setCustomerToEdit(fullCustomer);

    this.router.navigate(['customer-details', currentCustomer.id], {
      relativeTo: this.route,
    });
  }

  goToCustomerOverview(rowData: any, event?: MouseEvent) {
    this.router.navigate(['/customers/customer-details', rowData.id]);
  }

  goToCustomerRegister() {
    this.customerStateService.clearCustomer();
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
          this.commonMessageService.showDeleteSucessfullMessage();
        },
        error: (error) => {
          this.isLoadingCustomer = false;
          this.visibleCustomerModal = false;
          if(error instanceof OccError || error?.message?.includes('404') || error?.errorType === 'DELETE_UNEXISTED'){
            this.showOCCErrorModalCustomer = true;
            this.occErrorType = 'DELETE_UNEXISTED';
            this.commonMessageService.showErrorDeleteMessage();
          } else if (error instanceof HttpErrorResponse && error.status === 500 && error.error.message.includes('foreign key constraint')){
            this.commonMessageService.showErrorDeleteMessageUsedByEntityWithName(error.error.message);
          } else {
            this.commonMessageService.showErrorDeleteMessage();
          }
        }
      });
    }
  }

}
