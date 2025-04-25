import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FundingProgramsComponent } from './funding-programs.component';

describe('FundingProgramsComponent', () => {
  let component: FundingProgramsComponent;
  let fixture: ComponentFixture<FundingProgramsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FundingProgramsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FundingProgramsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
