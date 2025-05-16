import { ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { filter, Subscription } from 'rxjs';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() menuItems: any[] = [];
  @Input() menulabel: string = '';
  @Output() toggleCollapse = new EventEmitter<void>();
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
  private readonly itemMasterData = 
    { 
      label: 'MENU.MASTER_DATA', 
      icon: 'pi pi-cog', 
      items: [
        {
          label: 'PEOPLE',
          isActive: false,
          items: [
            { label: 'USER', path: 'user' },
            { label: 'ROLES', path: 'roles' },
            { label: 'IWS_STAFF', path: 'iws-staff' },
            { label: 'IWS_COMMISSIONS', path: 'iws-commissions' },
            { label: 'IWS_TEAMS', path: 'iws-teams' },
            { label: 'EMPLOYEE_QUALIFICATION', path: 'employee-qualification' },
          ],
        },
        {
          label: 'FINANCE',
          isActive: false,
          items: [
            { label: 'FUNDING_PROGRAMS', path: 'funding-programs' },
            { label: 'COST', path: 'cost' },
            { label: 'BILLERS', path: 'billers' },
            { label: 'SALES_TAX', path: 'sales-tax' },
            { label: 'DUNNING_LEVELS', path: 'dunning-levels' },
            { label: 'BILLING_METHODS', path: 'billing-methods' },
            { label: 'TERMS_OF_PAYMENT', path: 'terms-payment' },
            { label: 'CONTRACT_STATUS', path: 'contract-status' },
          ],
        },
        {
          label: 'OPERATIONS',
          isActive: false,
          items: [
            { label: 'ORDER_TYPES', path: 'order-types' },
            { label: 'APPROVAL_STATUS', path: 'approval-status' },
            { label: 'ABSENCE_TYPES', path: 'absence-types' },
            { label: 'HOLIDAYS', path: 'holidays' },
            { label: 'STATES', path: 'states' },
            { label: 'NETWORKS', path: 'networks' },
          ],
        },
        {
          label: 'LOCATION',
          isActive: false,
          items: [
            { label: 'ADDRESS', path: 'address' },
            { label: 'COUNTRIES', path: 'countries' },
            { label: 'TITLE', path: 'title' },
          ],
        },
        {
          label: 'PROJECTS',
          isActive: false,
          items: [
            { label: 'PROJECT_STATUS', path: 'project-status' },
            { label: 'PROJECT_FUNNELS', path: 'project-funnels' },
            { label: 'REALIZATION_PROBABILITIES', path: 'realization-probabilities' },
          ],
        },
        {
          label: 'CONFIGURATION',
          isActive: false,
          items: [
            { label: 'SYSTEM_CONSTANTS', path: 'system-constants' },
            { label: 'TEXTS', path: 'texts' },
            { label: 'TYPES_OF_COMPANIES', path: 'type-companies' },
          ],
        },
      ],
      command: 'masterdata', 
      absoluteRoute: '/master-data' 
    }

  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly cdRef: ChangeDetectorRef
  ){}

  ngOnInit(){
    this.updateActiveStates();
    this.masterDataGroups = this.getOptionsMasterData();
    this.langSubscription = this.translate.onLangChange.subscribe(() => {
      this.masterDataGroups = this.getOptionsMasterData();
    });

    this.checkMasterDataRoute();
    this.router.events
      .pipe(
        filter(event => event instanceof NavigationEnd),
      )
      .subscribe(() => {
        this.checkMasterDataRoute();
        this.cdRef.detectChanges();
        this.updateActiveStates();
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
    
    if (currentRoute.includes('master-data')) {
      masterDataItem.classList.add('active');
    } else {
      masterDataItem.classList.remove('active');
    }
  }

  private updateActiveStates() {
    this.masterDataGroups.forEach(group => {
      group.isActive = group.items.some(item => 
        this.router.isActive(item.routerLink[0], {
          paths: 'subset',
          queryParams: 'subset',
          fragment: 'ignored',
          matrixParams: 'ignored'
        })
      );
      console.log('activo:',group.isActive);
      console.log('array:',this.masterDataGroups);
      
    });
  }
}
