import { TestBed } from '@angular/core/testing';

import { WorkContractsService } from './work-contracts.service';

describe('WorkContractsService', () => {
  let service: WorkContractsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(WorkContractsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
