import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';

export interface SidebarGroupItem extends MenuItem {
  items?: MenuItem[];
  open?: boolean;
}

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: false,
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() menuItems: SidebarGroupItem[] = [];
  @Output() toggleCollapse = new EventEmitter<void>();
}
