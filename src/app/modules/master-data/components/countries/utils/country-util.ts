import { inject } from '@angular/core';
import {
  Observable,
  catchError,
  map,
  switchMap,
  take,
  throwError,
} from 'rxjs';
import { CountryService } from '../../../../../Services/country.service';
import { Country } from '../../../../../Entities/country';
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

  loadInitialData(): Observable<Country[]> {
    return this.countryService.loadInitialData();
  }
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
    const name = nameC?.trim();
    const label = labelC?.trim();
    
    if (!name) {
      return throwError(() => new Error('Country name is required'));
    }
    if (!label) {
      return throwError(() => new Error('Country abbreviation is required'));
    }

    return this.countryExists(name, label).pipe(
      switchMap(({ nameExists, labelExists }) => {
        if (nameExists) {
          return throwError(() => new Error('name already exists'));
        }
        if (labelExists) {
          return throwError(() => new Error('abbreviation already exists'));
        }
        
        return this.countryService.addCountry({
          name: name,
          label: label,
          isDefault: isDefaultC,
        });
      }),
      catchError((err) => {
        if (err.message === 'name already exists' || err.message === 'abbreviation already exists') {
          return throwError(() => err);
        }
        return throwError(() => new Error('COUNTRY.ERROR.CREATION_FAILED'));
      })
    );
  }

  /**
   * Checks if a COUNTRY exists (case-insensitive comparison) for both name and abbreviation
   * @param name - Name to check
   * @param label - Abbreviation to check
   * @returns Observable emitting object with existence flags
   */
  countryExists(name: string, label?: string): Observable<{ nameExists: boolean; labelExists: boolean }> {
    return this.countryService.getAllCountries().pipe(
      map((countries) => ({
        nameExists: countries.some((c) => c.name?.toLowerCase() === name?.toLowerCase()),
        labelExists: label ? countries.some((c) => c.label?.toLowerCase() === label?.toLowerCase()) : false
      })),
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
   * Updates a country by ID and updates the internal countries signal.
   * @param country - Country object with updated data
   * @returns Observable that completes when the update is done
   */
  updateCountry(country: Country): Observable<Country> {
    if (!country.id) {
      return throwError(() => new Error('Invalid country data'));
    }
    const name = country.name?.trim();
    const label = country.label?.trim();
    
    if (!name) {
      return throwError(() => new Error('Country name is required'));
    }
    if (!label) {
      return throwError(() => new Error('Country abbreviation is required'));
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

        return this.countryExists(name, label).pipe(
          switchMap(({ nameExists, labelExists }) => {
            const currentName = currentCountry.name?.toLowerCase() || '';
            const currentLabel = currentCountry.label?.toLowerCase() || '';
            
            if (nameExists && currentName !== name.toLowerCase()) {
              return throwError(() => new Error('name already exists'));
            }
            if (labelExists && currentLabel !== label.toLowerCase()) {
              return throwError(() => new Error('abbreviation already exists'));
            }
            
            return this.countryService.updateCountry(country);
          })
        );
      }),
      catchError((err) => {
        return throwError(() => err);
      })
    );
  }
}