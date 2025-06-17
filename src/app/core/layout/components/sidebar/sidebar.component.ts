import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Input } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, filter, Subscription } from 'rxjs';
import { MainMenu, MenuItem, MenuSection } from '../../interfaces/menu-master-data-interface';
import { SidebarStateService } from '../../sidebar-state.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() isCollapsed!: boolean;
  @Input() menuItems: any[] = [];
  public showPopup: boolean = false;
  public masterDataGroups: {
        label: any;
        isActive: boolean;
        items: {
            label: any;
            routerLink: string[];
        }[];
    }[] = [];
  private langSubscription!: Subscription;
  private static readonly MENU_SECTIONS: Record<string, { label: string, path: string }[]> = {
    PEOPLE: [
      { label: 'USER', path: 'user' },
      { label: 'ROLES', path: 'roles' },
      { label: 'IWS_STAFF', path: 'iws-staff' },
      { label: 'IWS_COMMISSIONS', path: 'iws-commissions' },
      { label: 'IWS_TEAMS', path: 'iws-teams' },
      { label: 'EMPLOYEE_QUALIFICATION', path: 'employee-qualification' },
    ],
    FINANCE: [
      { label: 'FUNDING_PROGRAMS', path: 'funding-programs' },
      { label: 'COST', path: 'cost' },
      { label: 'BILLERS', path: 'billers' },
      { label: 'SALES_TAX', path: 'sales-tax' },
      { label: 'DUNNING_LEVELS', path: 'dunning-levels' },
      { label: 'BILLING_METHODS', path: 'billing-methods' },
      { label: 'TERMS_OF_PAYMENT', path: 'terms-payment' },
      { label: 'CONTRACT_STATUS', path: 'contract-status' },
    ],
    OPERATIONS: [
      { label: 'ORDER_TYPES', path: 'order-types' },
      { label: 'APPROVAL_STATUS', path: 'approval-status' },
      { label: 'ABSENCE_TYPES', path: 'absence-types' },
      { label: 'HOLIDAYS', path: 'holidays' },
      { label: 'STATES', path: 'states' },
      { label: 'NETWORKS', path: 'networks' },
    ],
    LOCATION: [
      { label: 'ADDRESS', path: 'salutation' },
      { label: 'COUNTRIES', path: 'countries' },
      { label: 'TITLE', path: 'title' },
    ],
    PROJECTS: [
      { label: 'PROJECT_STATUS', path: 'project-status' },
      { label: 'PROJECT_FUNNELS', path: 'project-funnels' },
      { label: 'REALIZATION_PROBABILITIES', path: 'realization-probabilities' },
    ],
    CONFIGURATION: [
      { label: 'SYSTEM_CONSTANTS', path: 'system-constants' },
      { label: 'TEXTS', path: 'texts' },
      { label: 'TYPES_OF_COMPANIES', path: 'type-companies' },
    ]
  };
  private readonly itemMasterData: MainMenu = {
    label: 'MENU.MASTER_DATA',
    icon: 'pi pi-cog',
    items: this.generateMenuSections()
  };
  
  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly cdRef: ChangeDetectorRef,
    private readonly sidebarState: SidebarStateService
  ){}

  ngOnInit(){
    this.masterDataGroups = this.getOptionsMasterData();
    this.updateActiveStates();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.masterDataGroups = this.getOptionsMasterData();
      this.updateActiveStates();
    });

    this.checkMasterDataRoute();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
        debounceTime(50)
      )
      .subscribe(() => {
        this.checkMasterDataRoute();
        this.updateActiveStates();
        this.cdRef.markForCheck();
      });
  }
  
  private getOptionsMasterData() {
    return this.itemMasterData.items.map((group) => ({
      label: this.translate.instant(`SIDEBAR.${group.label}`),
      isActive: group.isActive,
      items: group.items.map((item) => ({
        label: this.translate.instant(`SIDEBAR.${item.label}`),
        routerLink: [`/master-data/${item.path}`],
      })),
    }));
  }

  private checkMasterDataRoute(): void {
    const currentRoute = this.router.url;
    const masterDataItem = document.getElementById('item-master-data');
    
    if (!masterDataItem) return;
    
    currentRoute.includes('master-data') ?
      masterDataItem.classList.add('active') : masterDataItem.classList.remove('active');
  }

  private updateActiveStates() {
    this.masterDataGroups.forEach(group => {
      group.isActive = group.items.some(item => 
        this.router.isActive(this.router.createUrlTree(item.routerLink), {
          paths: 'subset',
          queryParams: 'subset',
          fragment: 'ignored',
          matrixParams: 'ignored'
        })
      );
    });
  }

  private generateMenuSections(): MenuSection[] {
    return Object.entries(SidebarComponent.MENU_SECTIONS).map(([label, items]) =>
      this.createMenuSection(label, items)
    );
  }

  private createMenuSection(label: string, items: MenuItem[], isActive: boolean = false): MenuSection {
    return { label, isActive, items };
  }

  toggleSidebar(): void {
    this.sidebarState.toggleSidebarLocalStorage();
  }

  onMenuHide() {
    this.showPopup = false;
  }

  onMenuShow(){
    this.showPopup = true;
  }
}
