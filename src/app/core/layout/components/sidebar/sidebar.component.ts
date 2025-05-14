import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';


@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.scss'],
  standalone: false,
})
export class SidebarComponent implements OnChanges {
  @Input() isCollapsed!: boolean;
  @Input() menuItems: any[] = [];
  @Input() menuKey: string = '';
  @Output() toggleCollapse = new EventEmitter<void>();

  public collapse!: boolean;

  ngOnChanges(changes: SimpleChanges): void {
    if(changes['isCollapsed']){
      this.collapse = this.isCollapsed;
    }
  }
}
