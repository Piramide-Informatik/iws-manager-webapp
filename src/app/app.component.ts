import { Component, inject, OnInit } from '@angular/core';

import {
  TranslateService,
  TranslatePipe,
  TranslateDirective,
} from '@ngx-translate/core';
import { UserPreferenceService } from './Services/user-preferences.service';
import { PrimeNGConfigService } from './shared/services/primeng-config.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [TranslatePipe, TranslateDirective],
  standalone: false,
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements OnInit {
  private readonly primeNGConfigService = inject(PrimeNGConfigService);

  title = 'iws-manager-webapp';

  public selectedLanguage!: string;

  constructor(private readonly translate: TranslateService, private readonly userPreferenceService: UserPreferenceService) {
    // Configura inglés como idioma por defecto e inicial
    this.translate.addLangs(['de', 'es', 'en']);
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
    this.selectedLanguage = lang;
    this.userPreferenceService.setLanguage(lang);
    this.primeNGConfigService.initialize();
  }

  ngOnInit(): void {
    const currentLanguage = this.userPreferenceService.getLanguage() ?? 'de';
    this.selectedLanguage = currentLanguage;
    this.translate.use(currentLanguage);
    this.primeNGConfigService.initialize();
  }
}
