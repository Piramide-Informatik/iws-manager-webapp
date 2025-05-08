import { TestBed } from '@angular/core/testing';

import { BillingMethodService } from './billing-method.service';

describe('BillingMethodService', () => {
  let service: BillingMethodService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BillingMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
