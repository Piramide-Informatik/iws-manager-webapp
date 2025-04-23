import { TestBed } from '@angular/core/testing';

import { CustomerDatastoreService } from './customer-datastore.service';

describe('CustomerDatastoreService', () => {
  let service: CustomerDatastoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CustomerDatastoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
