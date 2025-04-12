import { TestBed } from '@angular/core/testing';

import { InvoicesDatastoreService } from './invoices-datastore.service';

describe('InvoicesDatastoreService', () => {
  let service: InvoicesDatastoreService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(InvoicesDatastoreService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
