import { Component, OnInit } from '@angular/core';
import { TranslateService, _ } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { ConfirmationService, MessageService } from 'primeng/api';

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

  private readonly sidebarItemsConfig: { labelKey: string; route: string;}[] = [
    { labelKey: 'SIDEBAR.EMPLOYEES', route: '/customers/pr/employees' },
    { labelKey: 'SIDEBAR.EMPLOYMENT_CONTRACTS', route: '/customers/work-contracts' },
    { labelKey: 'SIDEBAR.PROJECTS', route: '/customers/projects' },
    { labelKey: 'SIDEBAR.ORDERS', route: '/customers/orders' },
    { labelKey: 'SIDEBAR.DEMANDS', route: '/customers/demands' },
    { labelKey: 'SIDEBAR.INVOICES', route: '/customers/invoices' },
    { labelKey: 'SIDEBAR.FRAMEWORK_AGREEMENTS', route: '/customers/framework-agreements' },
    { labelKey: 'SIDEBAR.CONTRACTORS', route: '/customers/contractors' },
    { labelKey: 'SIDEBAR.SUBCONTRACTS', route: '/customers/subcontracts' },
  ];

  constructor(
    private readonly translate: TranslateService,
  ){}


  ngOnInit(): void {
    this.customer = 'Joe Doe'
    this.loadSidebarItems();
  }

  loadSidebarItems(): void {
    this.currentSidebarItems = this.sidebarItemsConfig.map((item) => ({
      label: item.labelKey,
      routerLink: [item.route],
    }));
  }
}
