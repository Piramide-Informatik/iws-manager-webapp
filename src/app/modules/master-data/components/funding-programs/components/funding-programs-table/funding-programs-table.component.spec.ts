import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingProgramsTableComponent } from './funding-programs-table.component';

describe('FundingProgramsTableComponent', () => {
  let component: FundingProgramsTableComponent;
  let fixture: ComponentFixture<FundingProgramsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FundingProgramsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundingProgramsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
