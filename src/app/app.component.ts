import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: false,
  styleUrls: ['./app.component.scss'], // Asegúrate de que sea styleUrls (plural)
})
export class AppComponent {
  title = 'iws-manager-webapp';

  constructor(private translate: TranslateService) {
    // Configura inglés como idioma por defecto e inicial
    this.translate.setDefaultLang('en');
    this.translate.use('en');
  }

  changeLanguage(lang: string) {
    this.translate.use(lang);
  }
}
