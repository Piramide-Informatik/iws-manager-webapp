import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-page-project',
  standalone: false,
  templateUrl: './page-project.component.html',
  styleUrl: './page-project.component.scss'
})
export class PageProjectComponent implements OnInit {
  private readonly activatedRoute = inject(ActivatedRoute);
  public projectId!: string;
  public currentMenuItems: MenuItem[] = [];
  public selectedPeojectId!: number;

  private readonly menuItemsConfig: { labelKey: string; route: string;}[] = [
    { labelKey: 'MENU_PROJECT.PROJECT', route: 'project-details'},
    { labelKey: 'MENU_PROJECT.ACCOUNTING_YEARS', route: 'accounting-years' },
    { labelKey: 'MENU_PROJECT.BLOCKS', route: 'blocks' },
    { labelKey: 'MENU_PROJECT.EMPLOYEES', route: 'employees-project' },
    { labelKey: 'MENU_PROJECT.SUBCONTRACTS', route: 'subcontracts' },
    { labelKey: 'MENU_PROJECT.TIMESHEET', route: 'timesheet' },
  ];


  ngOnInit(): void {
    this.activatedRoute.firstChild?.paramMap.subscribe(params => {
      this.projectId = params.get('idProject') ?? '';
      this.selectedPeojectId = Number(this.projectId);
    });
    this.loadMenuItems();
  }

  loadMenuItems(): void {
    this.currentMenuItems = this.menuItemsConfig.map((item) => ({
      label: item.labelKey,
        routerLink: ['/projects', item.route, this.selectedPeojectId],
    }));
  }

  onCustomerChange(){
    this.loadMenuItems();
  } 

}
