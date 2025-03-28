import { Component, OnInit, ViewChild } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss',
  standalone: false,
})
export class MainLayoutComponent implements OnInit {
  sidebarCollapsed: boolean = false;
  mainMenuVisible: boolean = false;
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  currentSidebarItems: MenuItem[] = [];
  mainMenuItems: any[] = [];

  ngOnInit(): void {
    this.mainMenuItems = [
      { label: 'Customers', icon: 'pi pi-cog', command: 'admin' },
      { label: 'Projects', icon: 'pi pi-box', command: 'inventory' },
      {
        label: 'Invoicing',
        icon: 'pi pi-shopping-cart',
        command: 'sales',
      },
      { label: 'Controlling', icon: 'pi pi-chart-bar', command: 'reports' },
      { label: 'Master Data', icon: 'pi pi-chart-bar', command: 'reports' },
    ];

    this.loadSidebarItems('admin');
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
          { label: 'Customer', routerLink: ['/customer/list-customers'] },
          { label: 'Employees', routerLink: ['/admin/roles'] },
          { label: 'Employment Contracts', routerLink: ['/work-contracts/list-work-contracts'], },
          { label: 'Projects', routerLink: ['/admin/roles'] },
          { label: 'Orders', routerLink: ['/admin/permissions'] },
          { label: 'Claims', routerLink: ['/admin/roles'] },
          { label: 'Invoices', routerLink: ['/admin/permissions'] },
          { label: 'Framework Agreements', routerLink: ['/admin/roles'] },
          { label: 'Contractors', routerLink: ['/admin/permissions'] },
          { label: 'Subcontracts', routerLink: ['/admin/permissions'] }
        ];
        break;
      case 'inventory':
        this.currentSidebarItems = [
          {
            label: 'Ingreso de Mercadería',
            icon: 'pi pi-plus',
            routerLink: ['/inventory/input'],
          },
          {
            label: 'Control de Stock',
            icon: 'pi pi-list',
            routerLink: ['/inventory/stock'],
          },
          {
            label: 'Productos',
            icon: 'pi pi-box',
            routerLink: ['/inventory/products'],
          },
        ];
        break;
      case 'sales':
        this.currentSidebarItems = [
          {
            label: 'Pedidos',
            icon: 'pi pi-shopping-cart',
            routerLink: ['/sales/orders'],
          },
          {
            label: 'Clientes',
            icon: 'pi pi-users',
            routerLink: ['/sales/customers'],
          },
        ];
        break;
      case 'reports':
        this.currentSidebarItems = [
          {
            label: 'Ventas',
            icon: 'pi pi-chart-line',
            routerLink: ['/reports/sales'],
          },
          {
            label: 'Inventario',
            icon: 'pi pi-chart-bar',
            routerLink: ['/reports/inventory'],
          },
        ];
        break;
    }
    this.mainMenuVisible = false;
  }

  onMainMenuSelect(menu: string): void {
    console.log('Menú seleccionado:', menu);
    this.loadSidebarItems(menu);
  }
}
