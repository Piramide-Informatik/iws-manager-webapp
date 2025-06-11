import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { CustomerService } from '../../../../Services/customer.service';

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
    private readonly activatedRoute: ActivatedRoute
  ){}


  ngOnInit(): void {
    this.activatedRoute.params.subscribe( params => {
      this.customerService.getAllCustomers().subscribe(customers => {
         this.customers = customers.map((customerItem: any) => ({
           id: customerItem.id,
           companyName: customerItem.customername2,
         }))
         this.customer = params['id']
         this.selectedCustomer = this.customers.find(customerItem => customerItem.companyName === this.customer).id;
      })
    })
    this.loadSidebarItems();
  }

  loadSidebarItems(): void {
    this.currentSidebarItems = this.sidebarItemsConfig.map((item) => ({
      label: item.labelKey,
      routerLink: [item.route],
    }));
  }
}
