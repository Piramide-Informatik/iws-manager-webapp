import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor() {}

  list() {
    return Promise.resolve([
      {
        id: 1,
        companyName: 'Empresa A',
        nameLine2: 'Sucursal A',
        kind: 'Retail',
        land: 'USA',
        place: 'New York',
        contact: '123-456',
      },
      {
        id: 2,
        companyName: 'Empresa B',
        nameLine2: 'Sucursal B',
        kind: 'Tech',
        land: 'Canada',
        place: 'Toronto',
        contact: '789-012',
      },
    ]);
  }
}
