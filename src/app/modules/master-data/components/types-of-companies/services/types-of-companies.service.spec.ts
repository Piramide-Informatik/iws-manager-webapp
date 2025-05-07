import { TestBed } from '@angular/core/testing';

import { TypesOfCompaniesService } from './types-of-companies.service';

describe('TypesOfCompaniesService', () => {
  let service: TypesOfCompaniesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TypesOfCompaniesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
