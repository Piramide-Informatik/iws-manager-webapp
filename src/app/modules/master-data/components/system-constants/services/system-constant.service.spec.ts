import { TestBed } from '@angular/core/testing';

import { SystemConstantService } from './system-constant.service';

describe('SystemConstantService', () => {
  let service: SystemConstantService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SystemConstantService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
