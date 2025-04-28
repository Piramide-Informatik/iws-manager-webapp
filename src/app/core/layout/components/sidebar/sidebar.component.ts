import { Component, Input } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() menuItems: MenuItem[] = [];
  @Input() menuKey: string = '';

  toggleCollapse() {
    this.isCollapsed = !this.isCollapsed;
  }
}
