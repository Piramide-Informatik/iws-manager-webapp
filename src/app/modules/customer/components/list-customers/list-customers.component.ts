import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../services/customer.service';
import { Table } from 'primeng/table';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { UserPreference } from '../../../../Entities/user-preference';

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

  public cols!: Column[];

  public customers!: Customer[];

  @ViewChild('dt2') dt2!: Table;

  private langSubscription!: Subscription;

  public selectedColumns!: Column[];

  public countries!: string[];
  public selectedCountries: any[] = [];
  userListCustomerPreferences: UserPreference = {};
  tableKey: string = 'ListCustomers'
  dataKeys = ['id', 'companyName', 'nameLine2', 'kind', 'land', 'place', 'contact'];

  constructor(private readonly customerService: CustomerService, 
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) { }

  ngOnInit(): void {

    
    this.customers = this.customerService.getCustomers();

    this.countries = Array.from(new Set(this.customers.map(customer => customer.land)))
                              .map(country => country);
    this.countries.sort((a, b) => a.localeCompare(b));
    this.loadColHeaders();
    this.selectedColumns = this.cols;
    this.userListCustomerPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
      this.userListCustomerPreferences = this.userPreferenceService.getUserPreferences(this.tableKey, this.selectedColumns);
    });
  }

  onUserListCustomerPreferencesChanges(userListCustomerPreferences: any) {
    localStorage.setItem('userPreferences', JSON.stringify(userListCustomerPreferences));
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'id', minWidth: 110, customClasses: ['align-right'], header: this.translate.instant(_('CUSTOMERS.TABLE.CUSTOMER_ID'))},
      { field: 'companyName', minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_NAME'))},
      { field: 'nameLine2',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.NAME_LINE_2'))},
      { field: 'kind',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_TYPE'))},
      { field: 'land',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.COUNTRY_NAME')), filter: { type: 'multiple', data: this.countries}},
      { field: 'place',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.CITY'))},
      { field: 'contact',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.CONTACT_PERSON'))}
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
    this.router.navigate(['customer-details'], { 
      relativeTo: this.route,
      state: { customer: "Joe Doe", customerData: currentCustomer } 
    });
  }

  goToCustomerOverview(rowData: any) {
    this.router.navigate(['/customers', rowData.nameLine2]);
  }

  goToCustomerRegister() {
    this.router.navigate(['customer-details'], { relativeTo: this.route })
  }

}
