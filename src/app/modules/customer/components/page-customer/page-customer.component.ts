import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { CustomerService } from '../../../../Services/customer.service';
import { SelectChangeEvent } from 'primeng/select';

@Component({
  selector: 'app-page-customer',
  standalone: false,
  providers: [ConfirmationService, MessageService],
  templateUrl: './page-customer.component.html',
  styleUrl: './page-customer.component.scss'
})
export class PageCustomerComponent implements OnInit {
  public customer!: string;
  public currentSidebarItems: MenuItem[] = [];
  private readonly customerService = inject(CustomerService);
  customers: any[] = [];
  selectedCustomer: number = 0;

  private readonly sidebarItemsConfig: { labelKey: string; route: string;}[] = [
    { labelKey: 'SIDEBAR.DETAILS', route: 'customer-details'},
    { labelKey: 'SIDEBAR.EMPLOYEES', route: 'employees' },
    { labelKey: 'SIDEBAR.EMPLOYMENT_CONTRACTS', route: 'work-contracts' },
    { labelKey: 'SIDEBAR.PROJECTS', route: 'projects' },
    { labelKey: 'SIDEBAR.ORDERS', route: 'orders' },
    { labelKey: 'SIDEBAR.DEMANDS', route: 'demands' },
    { labelKey: 'SIDEBAR.INVOICES', route: 'invoices' },
    { labelKey: 'SIDEBAR.FRAMEWORK_AGREEMENTS', route: 'framework-agreements' },
    { labelKey: 'SIDEBAR.CONTRACTORS', route: 'contractors' },
    { labelKey: 'SIDEBAR.SUBCONTRACTS', route: 'subcontracts' },
  ];

  constructor(
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute
  ){}


  ngOnInit(): void {
    this.customerService.getAllCustomers().subscribe(customers => {
       this.customers = customers.map((customerItem: any) => ({
         id: customerItem.id,
         companyName: customerItem.customername1,
       }))
       this.customer =  ''+this.router.url.split('/').pop()
       
       this.selectedCustomer = this.customers.find(customerItem => customerItem.id === Number(this.customer)).id;
      
       this.loadSidebarItems();
    })
  }

  onSelectedItem(event: SelectChangeEvent) {
    this.router.navigate(['customers/customer-details', event.value], { 
      state: { customer: event.value, customerData: {}} 
    });
  }

  loadSidebarItems(): void {
    this.currentSidebarItems = this.sidebarItemsConfig.map((item) => ({
      label: item.labelKey,
       routerLink: ['/customers', item.route, this.selectedCustomer],
    }));
  }
}
