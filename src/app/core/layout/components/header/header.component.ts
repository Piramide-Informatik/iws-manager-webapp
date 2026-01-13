import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../../Services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false,
})
export class HeaderComponent implements OnInit {
  @Input() username: string = '';

  @Input() currentMenuKey: string = '';

  @Output() toggleMenu = new EventEmitter<void>();
  @Output() menuSelected = new EventEmitter<string>();
  @Input() items: any[] = [];
  userMenuItems: MenuItem[] = [];

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.userMenuItems = [
      {
        label: 'Profile',
        icon: 'pi pi-user',
        routerLink: ['/profile'],
      },
      {
        label: 'Change Password',
        icon: 'pi pi-key',
        routerLink: ['/change-password'],
      },
      {
        label: 'Settings',
        icon: 'pi pi-cog',
        routerLink: ['/settings'],
      },
      {
        separator: true,
      },
      {
        label: 'Logout',
        icon: 'pi pi-sign-out',
        command: () => this.logout(),
      },
    ];
  }

  onMenuSelect(menu: string, index: number): void {
    console.log('menu:', menu);
    
    this.menuSelected.emit(menu);
    const menuOptions: HTMLCollectionOf<Element> =
      document.getElementsByClassName('menu-options');
    const option = menuOptions[index];

    Array.from(menuOptions).forEach((element) => {
      element.classList.remove('active');
    });
    option.classList.add('active');
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
