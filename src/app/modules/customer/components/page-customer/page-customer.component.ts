import { Component, inject, OnInit, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService, MenuItem } from 'primeng/api';
import { SelectChangeEvent } from 'primeng/select';
import { toSignal } from '@angular/core/rxjs-interop';
import { CustomerUtils } from '../../utils/customer-utils';
import { map } from 'rxjs';

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
  private readonly customerUtils = inject(CustomerUtils);
  public customers = toSignal(
    this.customerUtils.getCustomersSortedByName().pipe(
      map(customers => customers.map(customer =>({
        id: customer.id,
        companyName: customer.customername1
      })))
    )
  );
  selectedCustomer = signal(0);

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
    private readonly activatedRoute: ActivatedRoute,
  ){}


  ngOnInit(): void {
    this.activatedRoute.firstChild?.paramMap.subscribe(params => {
      this.customer = params.get('id') ?? '';
      this.selectedCustomer.set(Number(this.customer))
    })
    this.loadSidebarItems();
  }

  onSelectedItem(event: SelectChangeEvent) {
    this.router.navigate(['customers/customer-details', event.value], { 
      state: { customer: event.value, customerData: {}} 
    });
  }

  loadSidebarItems(): void {
    this.currentSidebarItems = this.sidebarItemsConfig.map((item) => ({
      label: item.labelKey,
       routerLink: ['/customers', item.route, this.selectedCustomer()],
    }));
  }

  onCustomerChange(){
    this.loadSidebarItems();
  } 
}
