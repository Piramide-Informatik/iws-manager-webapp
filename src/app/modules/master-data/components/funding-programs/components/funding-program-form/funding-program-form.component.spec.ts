import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingProgramFormComponent } from './funding-program-form.component';

describe('EditFundingProgramComponent', () => {
  let component: FundingProgramFormComponent;
  let fixture: ComponentFixture<FundingProgramFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FundingProgramFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundingProgramFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
