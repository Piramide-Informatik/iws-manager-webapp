import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
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
    private readonly translate: TranslateService,
    private readonly activatedRoute: ActivatedRoute
  ){}


  ngOnInit(): void {
    this.activatedRoute.params.subscribe( params => {
      this.customer = params['id']
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
