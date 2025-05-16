import { ChangeDetectionStrategy, ChangeDetectorRef, Component, EventEmitter, Input, Output } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { debounceTime, filter, Subscription } from 'rxjs';
import { MASTER_DATA_MENU_ITEM } from '../../constants/menu-master-data-constants';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() menuItems: any[] = [];
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
  private readonly itemMasterData = MASTER_DATA_MENU_ITEM;
  
  constructor(
    private readonly translate: TranslateService,
    private readonly router: Router,
    private readonly cdRef: ChangeDetectorRef
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
}
