import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

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
  private currentMenuKey: string = 'customers';

  private readonly sidebarItemsConfig: Record<
    string,
    { labelKey: string; icon?: string; route: string }[]
  > = {
    customers: [
      { labelKey: 'SIDEBAR.CUSTOMER', route: '/customers' },
      { labelKey: 'SIDEBAR.EMPLOYEES', route: '/employees' },
      { labelKey: 'SIDEBAR.EMPLOYMENT_CONTRACTS', route: '/work-contracts' },
      { labelKey: 'SIDEBAR.PROJECTS', route: '/projects' },
      { labelKey: 'SIDEBAR.ORDERS', route: '/orders' },
      { labelKey: 'SIDEBAR.DEMANDS', route: '/demands' },
      { labelKey: 'SIDEBAR.INVOICES', route: '/invoices' },
      {
        labelKey: 'SIDEBAR.FRAMEWORK_AGREEMENTS',
        route: '/framework-agreements',
      },
      { labelKey: 'SIDEBAR.CONTRACTORS', route: '/contractors' },
      { labelKey: 'SIDEBAR.SUBCONTRACTS', route: '/subcontracts' },
    ],
    inventory: [
      {
        labelKey: 'SIDEBAR.GOODS_ENTRY',
        icon: 'pi pi-plus',
        route: '/inventory/input',
      },
      {
        labelKey: 'SIDEBAR.STOCK_CONTROL',
        icon: 'pi pi-list',
        route: '/inventory/stock',
      },
      {
        labelKey: 'SIDEBAR.PRODUCTS',
        icon: 'pi pi-box',
        route: '/inventory/products',
      },
    ],
    sales: [
      {
        labelKey: 'SIDEBAR.ORDERS',
        icon: 'pi pi-shopping-cart',
        route: '/sales/orders',
      },
      {
        labelKey: 'SIDEBAR.CUSTOMERS',
        icon: 'pi pi-users',
        route: '/sales/customers',
      },
    ],
    reports: [
      {
        labelKey: 'SIDEBAR.SALES',
        icon: 'pi pi-chart-line',
        route: '/reports/sales',
      },
      {
        labelKey: 'SIDEBAR.INVENTORY',
        icon: 'pi pi-chart-bar',
        route: '/reports/inventory',
      },
    ],
  };

  private getMasterDataSidebar(): any[] {
    return [
      {
        label: this.translate.instant('SIDEBAR.GROUP_PERSONAS_Y_USUARIOS'),
        items: [
          {
            label: this.translate.instant('SIDEBAR.USER'),
            routerLink: ['/master-data/user'],
          },
          {
            label: this.translate.instant('SIDEBAR.ROLES'),
            routerLink: ['/master-data/roles'],
          },
          {
            label: this.translate.instant('SIDEBAR.IWS_STAFF'),
            routerLink: ['/master-data/iws-staff'],
          },
          {
            label: this.translate.instant('SIDEBAR.IWS_COMMISSIONS'),
            routerLink: ['/master-data/iws-commissions'],
          },
          {
            label: this.translate.instant('SIDEBAR.IWS_TEAMS'),
            routerLink: ['/master-data/iws-teams'],
          },
        ],
      },
      {
        label: this.translate.instant('SIDEBAR.GROUP_LOCALIZACION'),
        items: [
          {
            label: this.translate.instant('SIDEBAR.COUNTRIES'),
            routerLink: ['/master-data/countries'],
          },
          {
            label: this.translate.instant('SIDEBAR.STATES'),
            routerLink: ['/master-data/states'],
          },
        ],
      },
      {
        label: this.translate.instant('SIDEBAR.GROUP_PARAMETROS_GENERALES'),
        items: [
          {
            label: this.translate.instant('SIDEBAR.TITLE'),
            routerLink: ['/master-data/title'],
          },
          {
            label: this.translate.instant('SIDEBAR.ORDER_TYPES'),
            routerLink: ['/master-data/order-types'],
          },
          {
            label: this.translate.instant('SIDEBAR.APPROVAL_STATUS'),
            routerLink: ['/master-data/approval-status'],
          },
          {
            label: this.translate.instant('SIDEBAR.HOLIDAYS'),
            routerLink: ['/master-data/holidays'],
          },
          {
            label: this.translate.instant('SIDEBAR.ABSENCE_TYPES'),
            routerLink: ['/master-data/absence-types'],
          },
          {
            label: this.translate.instant('SIDEBAR.FUNDING_PROGRAMS'),
            routerLink: ['/master-data/funding-programs'],
          },
        ],
      },
      {
        label: this.translate.instant('SIDEBAR.GROUP_PROYECTOS'),
        items: [
          {
            label: this.translate.instant('SIDEBAR.PROJECT_STATUS'),
            routerLink: ['/master-data/project-status'],
          },
          {
            label: this.translate.instant('SIDEBAR.PROJECT_FUNNELS'),
            routerLink: ['/master-data/project-funnels'],
          },
          {
            label: this.translate.instant('SIDEBAR.REALIZATION_PROBABILITIES'),
            routerLink: ['/master-data/realization-probabilities'],
          },
        ],
      },
      {
        label: this.translate.instant('SIDEBAR.GROUP_FACTURACION'),
        items: [
          {
            label: this.translate.instant('SIDEBAR.BILLERS'),
            routerLink: ['/master-data/billers'],
          },
          {
            label: this.translate.instant('SIDEBAR.DUNNING_LEVELS'),
            routerLink: ['/master-data/dunning-levels'],
          },
          {
            label: this.translate.instant('SIDEBAR.SALES_TAX'),
            routerLink: ['/master-data/sales-tax'],
          },
          {
            label: this.translate.instant('SIDEBAR.BILLING_METHODS'),
            routerLink: ['/master-data/billing-methods'],
          },
          {
            label: this.translate.instant('SIDEBAR.CONTRACT_STATUS'),
            routerLink: ['/master-data/contract-status'],
          },
          {
            label: this.translate.instant('SIDEBAR.TERMS_OF_PAYMENT'),
            routerLink: ['/master-data/terms-of-payment'],
          },
        ],
      },
      {
        label: this.translate.instant('SIDEBAR.GROUP_TECNICOS_Y_AYUDA'),
        items: [
          {
            label: this.translate.instant('SIDEBAR.EMPLOYEE_QUALIFICATION'),
            routerLink: ['/master-data/employee-qualification'],
          },
          {
            label: this.translate.instant('SIDEBAR.NETWORKS'),
            routerLink: ['/master-data/networks'],
          },
          {
            label: this.translate.instant('SIDEBAR.SYSTEM_CONSTANTS'),
            routerLink: ['/master-data/system-constants'],
          },
          {
            label: this.translate.instant('SIDEBAR.TEXTS'),
            routerLink: ['/master-data/texts'],
          },
        ],
      },
    ];
  }

  constructor(private readonly translate: TranslateService) {}

  ngOnInit(): void {
    this.sidebarItemsConfig['masterdata'] = this.getMasterDataSidebar().map(
      (group) => ({
        ...group,
        open: false,
      })
    );

    this.loadMainMenuItems();
    this.loadSidebarItems(this.currentMenuKey);

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.sidebarItemsConfig['masterdata'] = this.getMasterDataSidebar().map(
        (group) => ({
          ...group,
          open: false,
        })
      );
      this.loadMainMenuItems();
      this.loadSidebarItems(this.currentMenuKey);
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
        icon: 'pi pi-cog',
        command: () => this.loadSidebarItems('dashboard'),
      },
      {
        label: this.translate.instant('MENU.CUSTOMERS'),
        icon: 'pi pi-cog',
        command: 'customers',
      },
      {
        label: this.translate.instant('MENU.PROJECTS'),
        icon: 'pi pi-box',
        command: () => this.loadSidebarItems('inventory'),
      },
      {
        label: this.translate.instant('MENU.INVOICING'),
        icon: 'pi pi-shopping-cart',
        command: () => this.loadSidebarItems('sales'),
      },
      {
        label: this.translate.instant('MENU.CONTROLLING'),
        icon: 'pi pi-chart-bar',
        command: () => this.loadSidebarItems('reports'),
      },
      {
        label: this.translate.instant('MENU.MASTER_DATA'),
        icon: 'pi pi-cog',
        command: 'masterdata',
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

    const config = this.sidebarItemsConfig[menu];

    if (Array.isArray(config) && 'items' in config[0]) {
      this.currentSidebarItems = config;
    } else if (Array.isArray(config)) {
      this.currentSidebarItems = config.map((item) => ({
        label: this.translate.instant(item.labelKey),
        icon: item.icon,
        routerLink: [item.route],
      }));
    } else {
      this.currentSidebarItems = [];
    }

    this.mainMenuVisible = false;
  }

  onMainMenuSelect(menu: string): void {
    console.log('Menú seleccionado:', menu);
    this.loadSidebarItems(menu);
  }
}
