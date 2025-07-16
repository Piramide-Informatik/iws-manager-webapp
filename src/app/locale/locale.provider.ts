import { LOCALE_ID, Provider } from '@angular/core';
import { LocaleService } from '../Services/locale.service'
import { LocaleId } from './locale-id';

export const LocaleProvider: Provider = {
  provide: LOCALE_ID,
  useClass: LocaleId,
  deps: [LocaleService],
};