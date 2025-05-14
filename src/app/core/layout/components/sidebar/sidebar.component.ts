import { Component, EventEmitter, Input, Output } from '@angular/core';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent {
  @Input() isCollapsed: boolean = false;
  @Input() menuItems: any[] = [];
  @Input() menuKey: string = '';
  @Output() toggleCollapse = new EventEmitter<void>();
  
}
