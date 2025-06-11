import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { Customer } from '../../../../Entities/customer.model';
import { CustomerService } from '../../../../Services/customer.service';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { forkJoin, Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';
import { CountryService } from '../../../../Services/country.service';
import { ContactPersonService } from '../../../../Services/contact-person.service';
import { ContactPerson } from '../../../../Entities/contactPerson';

interface Column {
  field: string,
  header: string,
  minWidth: number,
  filter?: any,
  customClasses?: string[]
}

@Component({
  selector: 'app-list-customers',
  standalone: false,
  templateUrl: './list-customers.component.html',
  styleUrl: './list-customers.component.scss'
})
export class ListCustomersComponent implements OnInit, OnDestroy {

  private readonly customerService = inject(CustomerService);
  private readonly countryService = inject(CountryService);
  private readonly contactPersonService = inject(ContactPersonService);

  public cols!: Column[];

  public customers!: Customer[];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  public selectedColumns!: Column[];

  public countries!: string[];
  public selectedCountries: any[] = [];
  customerData: any[] = [];
  contacts: any = {};
  userListCustomerPreferences: UserPreference = {};
  tableKey: string = 'ListCustomers'
  dataKeys = ['id', 'companyName', 'nameLine2', 'kind', 'land', 'place', 'contact'];

  constructor(private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {
    forkJoin([
      this.countryService.getAllCountries(),
      this.contactPersonService.getAllContactPersons()
    ]).subscribe(([
      countries,
      contacts
    ]) => {
      this.countries = countries.map(country => country.name);
      this.loadColHeaders();
      this.selectedColumns = this.cols;
      this.userListCustomerPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
      this.contacts = contacts.reduce((acc: any, curr: ContactPerson) => {
        if (curr.customer) {
          acc[curr.customer.id] = `${curr.firstName} ${curr.lastName}`
        }
        return acc;
      }, {})
      this.customerData = this.customerService.customers().map(customer => ({
        id: customer.id,
        companyName: customer.customername1,
        nameLine2: customer.customername2,
        kind: customer.companytype?.name,
        land: customer.country?.name,
        place: customer.city,
        contact: this.contacts[customer.id] ?? ''
      }));
    })
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.selectedColumns = this.cols;
      this.userListCustomerPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  onUserListCustomerPreferencesChanges(userListCustomerPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userListCustomerPreferences));
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'id', minWidth: 110, customClasses: ['align-right'], header: this.translate.instant(_('CUSTOMERS.TABLE.CUSTOMER_ID')) },
      { field: 'companyName', minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_NAME')) },
      { field: 'nameLine2', minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.NAME_LINE_2')) },
      { field: 'kind', minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_TYPE')) },
      { field: 'land', minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.COUNTRY_NAME')), filter: { type: 'multiple', data: this.countries } },
      { field: 'place', minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.CITY')) },
      { field: 'contact', minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.CONTACT_PERSON')) }
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
      const countriesNames: string[] = this.selectedCountries.map(country => country.nameCountry);
      this.dt2.filter(countriesNames, 'land', 'in');
    } else {
      this.dt2.filter(null, 'land', 'in');
    }
  }

  deleteCustomer(id: number) {
    this.customers = this.customers.filter(customer => customer.id !== id);
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
      })
    })
  }

  goToCustomerDetails(currentCustomer: Customer) {
    this.router.navigate([currentCustomer.id, 'customer-details'], {
      relativeTo: this.route,
      state: { customer: currentCustomer.id, customerData: currentCustomer }
    });
  }

  goToCustomerOverview(rowData: any) {
    this.router.navigate(['/customers', rowData.id]);
  }

  goToCustomerRegister() {
    this.router.navigate(['customer-details'], { relativeTo: this.route })
  }

}
