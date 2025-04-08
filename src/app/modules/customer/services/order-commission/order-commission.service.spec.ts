import { TestBed } from '@angular/core/testing';

import { OrderCommissionService } from './order-commission.service';

describe('OrderCommissionService', () => {
  let service: OrderCommissionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OrderCommissionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
