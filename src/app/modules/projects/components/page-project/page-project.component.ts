import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { MenuItem } from 'primeng/api';
import { filter, Subscription } from 'rxjs';

@Component({
  selector: 'app-page-project',
  standalone: false,
  templateUrl: './page-project.component.html',
  styleUrl: './page-project.component.scss'
})
export class PageProjectComponent implements OnInit, OnDestroy {
  private readonly activatedRoute = inject(ActivatedRoute);
  private readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly routerSubscription = new Subscription();
  public projectId!: string;
  public currentMenuItems: MenuItem[] = [];
  public itemsPopup: MenuItem[] = [];
  public selectedProjectId!: number;
  private activedRouteEmployee = false;

  private readonly menuItemsConfig: { labelKey: string; route: string;}[] = [
    { labelKey: 'MENU_PROJECT.PROJECT', route: 'project-details'},
    { labelKey: 'MENU_PROJECT.ACCOUNTING_YEARS', route: 'accounting-years' },
    { labelKey: 'MENU_PROJECT.BLOCKS', route: 'blocks' },
    { labelKey: 'MENU_PROJECT.EMPLOYEES', route: 'employees-project' },
    { labelKey: 'MENU_PROJECT.SUBCONTRACTS', route: 'subcontracts' },
    { labelKey: 'MENU_PROJECT.TIMESHEET', route: 'timesheet' },
  ];

  private readonly itemsEmployeePopup: { labelKey: string; route: string;}[] = [
    { labelKey: 'MENU_PROJECT.SUBMENU_EMPLOYEES.EMPLOYEES_OVERVIEW', route: 'employees-project' },
    { labelKey: 'MENU_PROJECT.SUBMENU_EMPLOYEES.WORK_PACKAGES', route: 'work-packages' },
  ];

  ngOnInit(): void {
    this.activatedRoute.firstChild?.paramMap.subscribe(params => {
      this.projectId = params.get('idProject') ?? '';
      this.selectedProjectId = Number(this.projectId);
    });
    this.loadMenuItems();

    this.routerSubscription.add(
      this.router.events
        .pipe(filter(event => event instanceof NavigationEnd))
        .subscribe(() => {
          this.checkActiveRoutes();
        })
    );
    
    // Suscribirse a cambios de idioma para actualizar las traducciones
    this.routerSubscription.add(
      this.translate.onLangChange.subscribe(() => {
        this.loadMenuItems();
      })
    );
    
    this.checkActiveRoutes();
  }

  ngOnDestroy(): void {
    this.routerSubscription.unsubscribe();
  }

  loadMenuItems(): void {
    this.currentMenuItems = this.menuItemsConfig.map((item) => ({
      id: item.route,
      label: item.labelKey,
      routerLink: ['/projects', item.route, this.selectedProjectId],
    }));

    this.itemsPopup = [
      {
        label: this.translate.instant('MENU_PROJECT.EMPLOYEES'),
        styleClass: this.activedRouteEmployee ? 'active' : '',
        items: this.itemsEmployeePopup.map((item)=> ({
          label: this.translate.instant(item.labelKey),
          routerLink: ['/projects', item.route, this.selectedProjectId],
        }))
      }
    ];
  }

  onCustomerChange(){
    this.loadMenuItems();
  } 

  checkActiveRoutes() {
    const url = this.router.url;
    
    // SOLO verificamos las 2 rutas que nos interesan
    this.activedRouteEmployee = this.isSpecificRouteActive(url);
    
    this.updateMenuStyle();
  }

  isSpecificRouteActive(url: string): boolean {
    // Verifica SOLO estas 2 rutas
    const isEmployeeProject = /^\/projects\/employees-project\/\d+$/.test(url);
    const isSpecialProject = /^\/projects\/work-packages\/\d+$/.test(url);
    
    return isEmployeeProject || isSpecialProject;
  }

  updateMenuStyle() {
    const projectsItem = this.itemsPopup[0];
    if (projectsItem) {
      projectsItem.styleClass = this.activedRouteEmployee ? 'active' : '';
    }
  }

}
