import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sub-menu',
  standalone: false,
  templateUrl: './sub-menu.component.html',
  styleUrl: './sub-menu.component.scss'
})
export class SubMenuComponent {
  @Input() isCollapsed: boolean = false;
  @Input() menuItems: MenuItem[] = [];
  @Input() menuKey: string = '';
  @Input() itemsPopup: MenuItem[] = []

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
