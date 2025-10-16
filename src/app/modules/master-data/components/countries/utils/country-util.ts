import { inject } from '@angular/core';
import {
  Observable,
  catchError,
  map,
  of,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { CountryService } from '../../../../../Services/country.service';
import { Country } from '../../../../../Entities/country';
import { CustomerUtils } from '../../../../customer/utils/customer-utils';
import {
  createNotFoundUpdateError,
  createUpdateConflictError,
} from '../../../../shared/utils/occ-error';
/**
 * Utility class for country-related business logic and operations.
 * Works with CountryService's reactive signals while providing additional functionality.
 */
export class CountryUtils {
  private readonly countryService = inject(CountryService);
  private readonly customerUtils = inject(CustomerUtils);

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
      catchError((err) => {
        return throwError(() => new Error('Failed to load country'));
      })
    );
  }

  /**
   * Creates a new country with validation
   * @param name - Name for the new country
   * @returns Observable that completes when country is created
   */
  createNewCountry(
    nameC: string,
    labelC: string,
    isDefaultC: boolean
  ): Observable<Country> {

    return this.countryService.addCountry({
      name: nameC.trim(),
      label: labelC.trim(),
      isDefault: isDefaultC,
    });
  }

  /**
   * Checks if a COUNTRY exists (case-insensitive comparison)
   * @param name - Name to check
   * @returns Observable emitting boolean indicating existence
   */
  countryExists(name: string): Observable<boolean> {
    return this.countryService.getAllCountries().pipe(
      map((countries) =>
        countries.some((c) => c.name.toLowerCase() === name.toLowerCase())
      ),
      catchError((err) => {
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
      map((countries) =>
        [...countries].sort((a, b) => a.name.localeCompare(b.name))
      ),
      catchError((err) => {
        return throwError(() => new Error('Failed to sort countries'));
      })
    );
  }

  /**
   * Refreshes countries data
   * @returns Observable that completes when refresh is done
   */
  refreshCountries(): Observable<void> {
    return new Observable<void>((subscriber) => {
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
    return this.countryService.deleteCountry(id);
  }

  /**
   * Checks if a country is used by any customer.
   * @param id - ID of the country to check
   * @returns Observable emitting boolean indicating usage
   */
  private checkCountryUsage(id: number): Observable<boolean> {
    return this.customerUtils.getAllCustomers().pipe(
      map((customers) =>
        customers.some((customer) => customer.country?.id === id)
      ),
      catchError(() => of(false))
    );
  }

  /**
   * Updates a country by ID and updates the internal countries signal.
   * @param country - Country object with updated data
   * @returns Observable that completes when the update is done
   */
  updateCountry(country: Country): Observable<Country> {
    if (!country.id) {
      return throwError(() => new Error('Invalid country data'));
    }

    return this.countryService.getCountryById(country.id).pipe(
      take(1),
      switchMap((currentCountry) => {
        if (!currentCountry) {
          return throwError(() => createNotFoundUpdateError('Country'));
        }

        if (currentCountry.version !== country.version) {
          return throwError(() => createUpdateConflictError('Country'));
        }

        return this.countryService.updateCountry(country);
      })
    );
  }
}
