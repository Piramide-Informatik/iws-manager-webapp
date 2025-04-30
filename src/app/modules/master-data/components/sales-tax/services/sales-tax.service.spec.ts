import { TestBed } from '@angular/core/testing';

import { SalesTaxService } from './sales-tax.service';

describe('SalesTaxService', () => {
  let service: SalesTaxService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesTaxService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
