import { Component } from '@angular/core';
import {
  TranslateService,
  TranslatePipe,
  TranslateDirective
} from "@ngx-translate/core";

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  providers: [TranslatePipe, TranslateDirective],
  standalone: false,
  styleUrls: ['./app.component.scss'], // Asegúrate de que sea styleUrls (plural)
})
export class AppComponent {
  title = 'iws-manager-webapp';

  constructor(private translate: TranslateService) {
    // Configura inglés como idioma por defecto e inicial
    this.translate.addLangs(['de', 'es', 'en']);
    this.translate.setDefaultLang('de');
    this.translate.use('de');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }
}
