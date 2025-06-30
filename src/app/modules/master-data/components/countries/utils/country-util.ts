import { inject } from '@angular/core';
import { Observable, catchError, map, switchMap, take, throwError } from 'rxjs';
import { CountryService } from '../../../../../Services/country.service';
import { Country } from '../../../../../Entities/country';

/**
 * Utility class for country-related business logic and operations.
 * Works with CountryService's reactive signals while providing additional functionality.
 */
export class CountryUtils {
  private readonly countryService = inject(CountryService);

  /**
   * Gets a country by ID with proper error handling
   * @param id - ID of the country to retrieve
   * @returns Observable emitting the country or undefined if not found
   */
  getCountryById(id: number): Observable<Country | undefined> {
    if (!id || id <= 0) {
      return throwError(() => new Error('Invalid country ID'));
    }

    return this.countryService.getCountryById(id).pipe(
      catchError(err => {
        return throwError(() => new Error('Failed to load country'));
      })
    );
  }

  /**
   * Creates a new country with validation
   * @param name - Name for the new country
   * @returns Observable that completes when country is created
   */
  createNewCountry(nameC: string, labelC: string, isDefaultC: boolean): Observable<void> {
    if (!nameC?.trim()) {
      return throwError(() => new Error('Country name cannot be empty'));
    }

    return new Observable<void>(subscriber => {
      this.countryService.addCountry({
        name: nameC.trim(),
        label: labelC.trim(),
        isDefault: isDefaultC
      });

      // Complete the observable after operation
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
   * Checks if a COUNTRY exists (case-insensitive comparison)
   * @param name - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  countryExists(name: string): Observable<boolean> {
    return this.countryService.getAllCountries().pipe(
      map(countries => countries.some(
        c => c.name.toLowerCase() === name.toLowerCase()
      )),
      catchError(err => {
        return throwError(() => new Error('Failed to check country existence'));
      })
    );
  }

  /**
   * Gets all countries sorted alphabetically by name
   * @returns Observable emitting sorted array of countries
   */
  getCountriesSortedByName(): Observable<Country[]> {
    return this.countryService.getAllCountries().pipe(
      map(countries => [...countries].sort((a, b) => a.name.localeCompare(b.name))),
      catchError(err => {
        return throwError(() => new Error('Failed to sort countries'));
      })
    );
  }

  /**
   * Refreshes countries data
   * @returns Observable that completes when refresh is done
   */
  refreshCountries(): Observable<void> {
    return new Observable<void>(subscriber => {
      this.countryService.refreshCountries();
      subscriber.next();
      subscriber.complete();
    });
  }

  /**
 * Deletes a country by ID and updates the internal countries signal.
 * @param id - ID of the country to delete
 * @returns Observable that completes when the deletion is done
 */
  deleteCountry(id: number): Observable<void> {
    return new Observable(observer => {
      this.countryService.deleteCountry(id);
      
      setTimeout(() => {
        if (!this.countryService.error()) {
          observer.next();
          observer.complete();
        } else {
          observer.error(this.countryService.error());
        }
      }, 100);
    });
  }

  /**
 * Updates a country by ID and updates the internal countries signal.
 * @param country - Country object with updated data
 * @returns Observable that completes when the update is done
 */
  updateCountry(country: Country): Observable<Country> {
    if(!country.id) {
      return throwError(() => new Error('Invalid country data'));
    }

    return this.countryService.getCountryById(country.id).pipe(
      take(1),
      switchMap((currentCountry) => {
        if(!currentCountry) {
          return throwError(() => new Error('Country not found'));
        }

        if (currentCountry.version !== country.version) {
          return throwError(() => new Error('Conflict detected: country version mismatch'));
        }

        return this.countryService.updateCountry(country);
      })
    );
  }
}