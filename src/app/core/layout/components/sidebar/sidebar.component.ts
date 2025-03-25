import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss',
  standalone: false
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() menuItems: MenuItem[] = [];
  @Output() toggleCollapse = new EventEmitter<void>();
}
