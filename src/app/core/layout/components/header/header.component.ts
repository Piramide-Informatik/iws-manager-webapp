import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false
})
export class HeaderComponent implements OnInit{
  @Input() username: string = '';
  @Output() toggleMenu = new EventEmitter<void>();
  @Output() menuSelected = new EventEmitter<string>();
  @Input() items: any[] = [];
  userMenuItems: MenuItem[] = [];

  ngOnInit(): void {
    this.userMenuItems = [
      {
        label: 'Perfil',
        icon: 'pi pi-user',
        routerLink: ['/profile']
      },
      {
        label: 'Cambiar Contraseña',
        icon: 'pi pi-key',
        routerLink: ['/change-password']
      },
      {
        label: 'Configuraciones',
        icon: 'pi pi-cog',
        routerLink: ['/settings']
      },
      {
        separator: true
      },
      {
        label: 'Cerrar Sesión',
        icon: 'pi pi-sign-out',
        command: () => this.logout()
      }
    ];
  }
  
  onMenuSelect(menu: string): void {
    this.menuSelected.emit(menu);
  }  

  logout() {
    // Implement logout logic
    console.log('Logging out...');
  }

}