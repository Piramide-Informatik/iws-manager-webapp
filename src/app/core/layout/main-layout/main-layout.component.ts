import { Component, OnInit, OnDestroy, ViewChild, inject } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Sidebar } from 'primeng/sidebar';
import { TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Router } from '@angular/router';
import { SidebarStateService } from '../sidebar-state.service'
import { AuthService } from '../../../Services/auth.service';

@Component({
  selector: 'app-main-layout',
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
  standalone: false,
})
export class MainLayoutComponent implements OnInit, OnDestroy {
  sidebarState = inject(SidebarStateService);
  authService = inject(AuthService);
  sidebarCollapsed$ = this.sidebarState.sidebarCollapsed$;
  isStateLoaded = false;
  mainMenuVisible: boolean = false;
  username: string = this.authService.getUsername() || 'User';
  @ViewChild('sidebarRef') sidebarRef!: Sidebar;
  currentSidebarItems: MenuItem[] = [];
  mainMenuItems: any[] = [];
  
  private langSubscription!: Subscription;
  public currentMenuKey: string = 'dashboard';
  
  private readonly menuConfigs:  
  {label: string, icon: string, command: string, absoluteRoute: string}[] = [
    { label: 'MENU.DASHBOARD', icon: 'pi pi-chart-bar', command: 'dashboard', absoluteRoute: '/dashboard' },
    { label: 'MENU.CUSTOMERS', icon: 'pi pi-users', command: 'customers', absoluteRoute: '/customers' },
    { label: 'MENU.PROJECTS', icon: 'pi pi-book', command: 'projects', absoluteRoute: '/projects' },
    { label: 'MENU.INVOICING', icon: 'pi pi-receipt', command: 'invoicing', absoluteRoute: '/invoicing' },
    { label: 'MENU.CONTROLLING', icon: 'pi pi-sliders-v', command: 'controlling', absoluteRoute: '/controlling' },
    
  ];
  
  private readonly sidebarItemsConfig: Record<
    string,
    { labelKey: string; route: string }[]
  > = {
    customers: [
    ],
    projects: [
    ],
    invoicing: [
    ],
    controlling: [
    ],
    masterdata: [
    ],
  };

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
  ) {
    this.sidebarState.sidebarCollapsed$.subscribe(() => {
      this.isStateLoaded = true;
    });
  }

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
    this.mainMenuItems = this.menuConfigs.map((menu)=> ({
      label: this.translate.instant(menu.label),
      icon: menu.icon,
      command: menu.command,
      absoluteRoute: menu.absoluteRoute
    }))
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
    this.loadSidebarItems(menu);
  }
}
