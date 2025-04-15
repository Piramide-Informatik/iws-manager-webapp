import { Component, OnInit, OnDestroy, ViewChild, ChangeDetectorRef } from '@angular/core';
import { Customer } from '../../../../Entities/customer';
import { CustomerService } from '../../services/customer.service';
import { Table } from 'primeng/table';
import { FormBuilder, FormGroup } from '@angular/forms';
import { TranslateService, _ } from "@ngx-translate/core";
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

interface Column {
  field: string,
  header: string,
  minWidth: number,
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

  constructor(private customerService: CustomerService, private translate: TranslateService, public router: Router) { }

  ngOnInit(): void {

    this.loadColHeaders();
    this.customers = this.customerService.list();

    this.selectedColumns = this.cols;

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadColHeaders();
      this.reloadComponent(true);
    });
  }

  loadColHeaders(): void {
    this.cols = [
      { field: 'id', minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.CUSTOMER_ID')) },
      { field: 'companyName', minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_NAME')) },
      { field: 'nameLine2',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.NAME_LINE_2')) },
      { field: 'kind',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.COMPANY_TYPE')) },
      { field: 'land',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.COUNTRY_NAME')) },
      { field: 'place',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.CITY')) },
      { field: 'contact',minWidth: 110, header: this.translate.instant(_('CUSTOMERS.TABLE.CONTACT_PERSON')) }
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

  deleteCustomer(id: number) {
    this.customers = this.customers.filter(customer => customer.id !== id);
  }

  reloadComponent(self: boolean, urlToNavigateTo?: string) {
    //skipLocationChange:true means dont update the url to / when navigating
    //console.log("Current route I am on:",this.router.url);
    const url = self ? this.router.url : urlToNavigateTo;
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${url}`]).then(() => {
        //console.log(`After navigation I am on:${this.router.url}`)
      })
    })
  }

    goToCustomerDetails(currentCustomer: Customer) {
      this.router.navigateByUrl('/customers/customer-details', { state: { customer: "Joe Doe", customerData: currentCustomer } });
    }

}
