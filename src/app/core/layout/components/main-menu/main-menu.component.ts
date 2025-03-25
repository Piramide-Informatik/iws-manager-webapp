import { Component, EventEmitter, Input, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-main-menu',
  templateUrl: './main-menu.component.html',
  styleUrl: './main-menu.component.scss',
  standalone: false
})
export class MainMenuComponent {
  @Input() items: MenuItem[] = [];
  @Output() menuSelected = new EventEmitter<string>();
  @Output() closeMenu = new EventEmitter<void>();
  
  onMenuSelect(menu: string): void {
    this.menuSelected.emit(menu);
  }
}
