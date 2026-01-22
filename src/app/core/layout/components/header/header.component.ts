import { Component, EventEmitter, inject, Input, OnInit, Output } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { AuthService } from '../../../../Services/auth.service';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { UserPreferenceService } from '../../../../Services/user-preferences.service';
import { PrimeNGConfigService } from '../../../../shared/services/primeng-config.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss',
  standalone: false,
})
export class HeaderComponent implements OnInit {
  private readonly primeNGConfigService = inject(PrimeNGConfigService);
  @Input() username: string = '';

  @Input() currentMenuKey: string = '';

  @Output() toggleMenu = new EventEmitter<void>();
  @Output() menuSelected = new EventEmitter<string>();
  @Input() items: any[] = [];
  userMenuItems: MenuItem[] = [];
  public selectedLanguage!: string;

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router,
    private readonly translate: TranslateService,
    private readonly userPreferenceService: UserPreferenceService
  ) {
    this.translate.addLangs(['de', 'es', 'en']);
  }

  ngOnInit(): void {
    const currentLanguage = this.userPreferenceService.getLanguage() ?? 'de';
    this.selectedLanguage = currentLanguage;
    this.translate.use(currentLanguage);
    this.primeNGConfigService.initialize();
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
    this.menuSelected.emit(menu);
    const menuOptions: HTMLCollectionOf<Element> =
      document.getElementsByClassName('menu-options');
    const option = menuOptions[index];

    Array.from(menuOptions).forEach((element) => {
      element.classList.remove('active');
    });
    option.classList.add('active');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.selectedLanguage = lang;
    this.userPreferenceService.setLanguage(lang);
    this.primeNGConfigService.initialize();
  }

  logout() {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}
