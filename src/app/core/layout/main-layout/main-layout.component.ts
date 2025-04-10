import { Component, OnInit, OnDestroy, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'], // Asegúrate de que sea styleUrls (plural)
  standalone: false,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarCollapsed: boolean = false;
  mainMenuVisible: boolean = false;
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  currentSidebarItems: MenuItem[] = [];
  mainMenuItems: MenuItem[] = [];
  private langSubscription!: Subscription;

  constructor(private translate: TranslateService) {}

  ngOnInit(): void {
    this.loadMainMenuItems();
    this.loadSidebarItems('admin');

    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.loadMainMenuItems();

      this.loadSidebarItems('admin');
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
        label: this.translate.instant('MENU.CUSTOMERS'),
        icon: 'pi pi-cog',
        command: () => this.loadSidebarItems('admin'),
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
    switch (menu) {
      case 'admin':
        this.currentSidebarItems = [
          {
            label: this.translate.instant('SIDEBAR.CUSTOMER'),
            routerLink: ['/customers/list'],
          },
          {
            label: this.translate.instant('SIDEBAR.EMPLOYEES'),
            routerLink: ['/employees'],
          },
          {
            label: this.translate.instant('SIDEBAR.EMPLOYMENT_CONTRACTS'),
            routerLink: ['/work-contracts'],
          },
          {
            label: this.translate.instant('SIDEBAR.PROJECTS'),
            routerLink: ['/projects'],
          },
          {
            label: this.translate.instant('SIDEBAR.ORDERS'),
            routerLink: ['/customers/order-details'],
          },
          {
            label: this.translate.instant('SIDEBAR.CLAIMS'),
            routerLink: ['/admin/roles'],
          },
          {
            label: this.translate.instant('SIDEBAR.INVOICES'),
            routerLink: ['/admin/permissions'],
          },
          {
            label: this.translate.instant('SIDEBAR.FRAMEWORK_AGREEMENTS'),
            routerLink: ['/framework-agreements'],
          },
          {
            label: this.translate.instant('SIDEBAR.CONTRACTORS'),
            routerLink: ['/admin/permissions'],
          },
          {
            label: this.translate.instant('SIDEBAR.SUBCONTRACTS'),
            routerLink: ['/admin/permissions'],
          },
        ];
        break;
      case 'inventory':
        this.currentSidebarItems = [
          {
            label: this.translate.instant('SIDEBAR.GOODS_ENTRY'),
            icon: 'pi pi-plus',
            routerLink: ['/inventory/input'],
          },
          {
            label: this.translate.instant('SIDEBAR.STOCK_CONTROL'),
            icon: 'pi pi-list',
            routerLink: ['/inventory/stock'],
          },
          {
            label: this.translate.instant('SIDEBAR.PRODUCTS'),
            icon: 'pi pi-box',
            routerLink: ['/inventory/products'],
          },
        ];
        break;
      case 'sales':
        this.currentSidebarItems = [
          {
            label: this.translate.instant('SIDEBAR.ORDERS'),
            icon: 'pi pi-shopping-cart',
            routerLink: ['/sales/orders'],
          },
          {
            label: this.translate.instant('SIDEBAR.CUSTOMERS'),
            icon: 'pi pi-users',
            routerLink: ['/sales/customers'],
          },
        ];
        break;
      case 'reports':
        this.currentSidebarItems = [
          {
            label: this.translate.instant('SIDEBAR.SALES'),
            icon: 'pi pi-chart-line',
            routerLink: ['/reports/sales'],
          },
          {
            label: this.translate.instant('SIDEBAR.INVENTORY'),
            icon: 'pi pi-chart-bar',
            routerLink: ['/reports/inventory'],
          },
        ];
        break;
      default:
        this.currentSidebarItems = [];
    }
    this.mainMenuVisible = false;
  }

  onMainMenuSelect(menu: string): void {
    console.log('Menú seleccionado:', menu);
    this.loadSidebarItems(menu);
  }
}
