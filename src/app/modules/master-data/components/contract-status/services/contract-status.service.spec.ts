import { TestBed } from '@angular/core/testing';

import { ContractStatusService } from './contract-status.service';

describe('ContractStatusService', () => {
  let service: ContractStatusService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ContractStatusService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
