import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: false,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed: boolean = false;
  mainMenuVisible: boolean = false;
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  currentSidebarItems: MenuItem[] = [];
  mainMenuItems: any[] = [];

  private langSubscription!: Subscription;
  public currentMenuKey: string = 'dashboard';

  private readonly sidebarItemsConfig: Record<
    string,
    { labelKey: string; icon?: string; route: string }[]
  > = {
    dashboard: [
      { labelKey: 'MENU.DASHBOARD', route: '/dashboard' }
    ],
    customers: [
      { labelKey: 'SIDEBAR.CUSTOMER', route: '/customers/customers' },
      { labelKey: 'SIDEBAR.EMPLOYEES', route: '/customers/employees' },
      { labelKey: 'SIDEBAR.EMPLOYMENT_CONTRACTS', route: '/customers/work-contracts' },
      { labelKey: 'SIDEBAR.PROJECTS', route: '/customers/projects' },
      { labelKey: 'SIDEBAR.ORDERS', route: '/customers/orders' },
      { labelKey: 'SIDEBAR.DEMANDS', route: '/customers/demands' },
      { labelKey: 'SIDEBAR.INVOICES', route: '/customers/invoices' },
      { labelKey: 'SIDEBAR.FRAMEWORK_AGREEMENTS', route: '/customers/framework-agreements' },
      { labelKey: 'SIDEBAR.CONTRACTORS', route: '/customers/contractors' },
      { labelKey: 'SIDEBAR.SUBCONTRACTS', route: '/customers/subcontracts' },
    ],
    projects: [
      { labelKey: 'SIDEBAR.GOODS_ENTRY', route: '/inventory/input' },
      { labelKey: 'SIDEBAR.STOCK_CONTROL', route: '/inventory/stock' },
      { labelKey: 'SIDEBAR.PRODUCTS', route: '/inventory/products' },
    ],
    invoicing: [
      { labelKey: 'SIDEBAR.ORDERS', route: '/sales/orders' },
      { labelKey: 'SIDEBAR.CUSTOMERS', route: '/sales/customers' },
    ],
    controlling: [
      { labelKey: 'SIDEBAR.SALES', route: '/reports/sales', },
      { labelKey: 'SIDEBAR.INVENTORY', route: '/reports/inventory' },
    ],
    masterdata: [
      { labelKey: 'SIDEBAR.SALES', route: '/reports/sales', },
      { labelKey: 'SIDEBAR.INVENTORY', route: '/reports/inventory' },
    ],
  };

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadMainMenuItems();
    this.determineMainRoute();

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadMainMenuItems();
      this.determineMainRoute();
    });
  }

  ngOnDestroy(): void {
    if (this.langSubscription) {
      this.langSubscription.unsubscribe();
    }
  }

  loadMainMenuItems(): void {
    this.mainMenuItems = [
      {
        label: this.translate.instant('MENU.DASHBOARD'),
        command: 'dashboard',
        absoluteRoute: '/dashboard'
      },
      {
        label: this.translate.instant('MENU.CUSTOMERS'),
        command: 'customers',
        absoluteRoute: '/customers'
      },
      {
        label: this.translate.instant('MENU.PROJECTS'),
        command: 'projects',
        absoluteRoute: '/projects'
      },
      {
        label: this.translate.instant('MENU.INVOICING'),
        command: 'invoicing',
        absoluteRoute: '/invoicing'
      },
      {
        label: this.translate.instant('MENU.CONTROLLING'),
        command: 'controlling',
        absoluteRoute: '/controlling'
      },
      {
        label: this.translate.instant('MENU.MASTER_DATA'),
        command: 'masterdata',
        absoluteRoute: '/master-data'
      },
    ];
  }

  toggleSidebar(): void {
    this.sidebarCollapsed = !this.sidebarCollapsed;
  }

  toggleMainMenu(): void {
    this.mainMenuVisible = !this.mainMenuVisible;
  }

  closeCallback(e: any): void {
    this.sidebarRef.close(e);
  }

  loadSidebarItems(menu: string): void {
    this.currentMenuKey = menu;

    if (menu === 'masterdata') {
      this.currentSidebarItems = [];
    } else {
      const config = this.sidebarItemsConfig[menu];

      if (Array.isArray(config)) {
        this.currentSidebarItems = config.map((item) => ({
          label: this.translate.instant(item.labelKey),
          icon: item.icon,
          routerLink: [item.route],
        }));
      } else {
        this.currentSidebarItems = [];
      }
    }

    this.mainMenuVisible = false;
  }

  private determineMainRoute() {
    const fullUrl = this.router.url;
    
    const mainRoute = fullUrl.split('/')[1] ?? 'dashboard';
    
    this.loadSidebarItems(mainRoute);
  }

  onMainMenuSelect(menu: string): void {
    console.log('Menú seleccionado:', menu);
    this.loadSidebarItems(menu);
  }
}
