import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { Country } from '../../../../../Entities/country';

@Injectable({ providedIn: 'root' })
export class CountryStateService {
  private readonly editCountrySource = new BehaviorSubject<Country | null>(null);
  currentCountry$ = this.editCountrySource.asObservable();

  setCountryToEdit(country: Country | null): void {
    this.editCountrySource.next(country);
  }

  clearCountry() {
    this.editCountrySource.next(null);
  }
}