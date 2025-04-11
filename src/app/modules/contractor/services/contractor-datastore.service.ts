import { Injectable } from '@angular/core';
import { Contractor } from '../../../Entities/contractor';

@Injectable({
  providedIn: 'root'
})
export class ContractorDatastoreService {
  constructor() { }

  list(): Contractor[] {
    return [
      { contractorLabel: 'STCH', contractorName: 'SadTech', countryLabel: 'England', street: 'Lake View #234', zipCode: '3490', city: 'Bradford', taxNro: '125-730-374'},
      { contractorLabel: 'UMCR', contractorName: 'UmbrellaCorp', countryLabel: 'France', street: 'Place Rossetti #8610', zipCode: '3284', city: 'Niza', taxNro: '952-730-374'},
      { contractorLabel: 'LKVW', contractorName: 'LakeView', countryLabel: 'England', street: 'DaVinci #5183', zipCode: '3490', city: 'Londres', taxNro: '862-730-374'},
      { contractorLabel: 'FRCH', contractorName: 'FreeTech', countryLabel: 'Germany', street: 'Lake View #234', zipCode: '8629', city: 'Dortmund', taxNro: '375-730-374'}
    ];
  }
}