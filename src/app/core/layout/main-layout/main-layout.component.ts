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
  mainMenuItems: MenuItem[] = [];

  private langSubscription!: Subscription;

  private readonly sidebarItemsConfig: Record<string, { labelKey: string; icon?: string; route: string }[]> = {
    customers: [
      { labelKey: 'SIDEBAR.CUSTOMER', route: '/customers' },
      { labelKey: 'SIDEBAR.EMPLOYEES', route: '/employees' },
      { labelKey: 'SIDEBAR.EMPLOYMENT_CONTRACTS', route: '/work-contracts' },
      { labelKey: 'SIDEBAR.PROJECTS', route: '/projects' },
      { labelKey: 'SIDEBAR.ORDERS', route: '/orders' },
      { labelKey: 'SIDEBAR.DEMANDS', route: '/demands' },
      { labelKey: 'SIDEBAR.INVOICES', route: '/invoices' },
      { labelKey: 'SIDEBAR.FRAMEWORK_AGREEMENTS', route: '/framework-agreements' },
      { labelKey: 'SIDEBAR.CONTRACTORS', route: '/contractors' },
      { labelKey: 'SIDEBAR.SUBCONTRACTS', route: '/subcontracts' },
    ],
    inventory: [
      { labelKey: 'SIDEBAR.GOODS_ENTRY', icon: 'pi pi-plus', route: '/inventory/input' },
      { labelKey: 'SIDEBAR.STOCK_CONTROL', icon: 'pi pi-list', route: '/inventory/stock' },
      { labelKey: 'SIDEBAR.PRODUCTS', icon: 'pi pi-box', route: '/inventory/products' },
    ],
    sales: [
      { labelKey: 'SIDEBAR.ORDERS', icon: 'pi pi-shopping-cart', route: '/sales/orders' },
      { labelKey: 'SIDEBAR.CUSTOMERS', icon: 'pi pi-users', route: '/sales/customers' },
    ],
    reports: [
      { labelKey: 'SIDEBAR.SALES', icon: 'pi pi-chart-line', route: '/reports/sales' },
      { labelKey: 'SIDEBAR.INVENTORY', icon: 'pi pi-chart-bar', route: '/reports/inventory' },
    ],
  };

  constructor(private readonly translate: TranslateService) {}

  ngOnInit(): void {
    this.loadMainMenuItems();
    this.loadSidebarItems('customers');

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadMainMenuItems();
      this.loadSidebarItems('customers');
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
        command: () => this.loadSidebarItems('customers'),
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
        icon: 'pi pi-chart-bar',
        command: () => this.loadSidebarItems('reports'),
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
    const config = this.sidebarItemsConfig[menu];
    if (config) {
      this.currentSidebarItems = config.map(item => ({
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