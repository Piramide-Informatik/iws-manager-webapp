import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { Country } from '../../../Entities/country.model';

@Injectable({
  providedIn: 'root'
})
export class CountryService {

  private readonly ROOT_URL = `${environment.BACK_END_HOST_DEV}`;

  constructor(private readonly http: HttpClient) { }

  // Get all countries
  getCountries(): Country[] {
    return [
      { uuid:'3f696a78-c73f-475c-80a6-f5a858648af1', name: 'Deutschland', label: 'DE', is_default: 1 },
      { uuid:'934923mn-c73f-475c-80a6-f5a858648af1', name: 'Switzerland', label: 'CH', is_default: 1 },
      { uuid:'0mdsfj52-c73f-475c-80a6-f5a858648af1', name: 'Frankreich', label: 'FR', is_default: 1 },
      { uuid:'b93kfdsf-c73f-475c-80a6-f5a858648af1', name: 'Amerika, USA', label: 'US', is_default: 1 },
      { uuid:'g34234k4-c73f-475c-80a6-f5a858648af1', name: 'Vereinigtes Königreich', label: 'GB', is_default: 1 },
      { uuid:'v3423dm7-c73f-475c-80a6-f5a858648af1', name: 'Spanien', label: 'ES', is_default: 1 },
      { uuid:'lb32473f-475c-80a6-80g5-f5a858648af1', name: 'Niederlande, Holland', label: 'NL', is_default: 1 },
      { uuid:'cm345736-c73f-475c-80a6-f5a858648af1', name: 'Mexico', label: 'MX', is_default: 1 }
    ]
  }

}