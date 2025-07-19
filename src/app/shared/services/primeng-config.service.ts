import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { PrimeNG } from 'primeng/config';

@Injectable({
  providedIn: 'root',
})
export class PrimeNGConfigService {
  constructor(
    private readonly primengConfig: PrimeNG,
    private readonly translate: TranslateService
  ) {}

  initialize() {
    this.translate.get('primeng_date').subscribe((translations) => {
      this.primengConfig.setTranslation({
        dayNames: translations.dayNames,
        dayNamesShort: translations.dayNamesShort,
        dayNamesMin: translations.dayNamesMin,
        monthNames: translations.monthNames,
        monthNamesShort: translations.monthNamesShort
      });
    });
  }
}