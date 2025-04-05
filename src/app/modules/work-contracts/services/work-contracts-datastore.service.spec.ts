import { TestBed } from '@angular/core/testing';

import { WorkContractsDataService } from './work-contracts-datastore.service';

describe('WorkContractsDataService', () => {
  let service: WorkContractsDataService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkContractsDataService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
