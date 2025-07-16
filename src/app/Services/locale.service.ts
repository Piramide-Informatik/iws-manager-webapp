import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocaleService {

  private _currentLocale: string = 'en-US';

  get currentLocale(): string {
    return this._currentLocale;
  }

  setLocale(locale: string): void {
    this._currentLocale = locale;
  }
}