import { Component } from '@angular/core';

import {
  TranslateService,
  TranslatePipe,
  TranslateDirective,
} from '@ngx-translate/core';
import { UserPreferenceService } from './Services/user-preferences.service';
import { LocaleService } from './Services/locale.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [TranslatePipe, TranslateDirective],
  standalone: false,
  styleUrls: ['./app.component.scss'], // Asegúrate de que sea styleUrls (plural)
})
export class AppComponent {
  title = 'iws-manager-webapp';

  public selectedLanguage!: string;

  constructor(
    private readonly translate: TranslateService, 
    private readonly userPreferenceService: UserPreferenceService,
    private readonly localeService: LocaleService) {
    // Configura inglés como idioma por defecto e inicial
    this.translate.addLangs(['de', 'es', 'en']);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.selectedLanguage = lang;
    this.userPreferenceService.setLanguage(lang);
    this.localeService.setLocale(lang);
  }

  ngOnInit(): void {
    const currentLanguage = this.userPreferenceService.getLanguage() ?? 'de';
    this.selectedLanguage = currentLanguage;
    this.localeService.setLocale(currentLanguage);
    this.translate.use(currentLanguage);
  }
}
