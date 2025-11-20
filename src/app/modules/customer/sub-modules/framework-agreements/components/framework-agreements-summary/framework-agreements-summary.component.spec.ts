import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameworkAgreementsSummaryComponent } from './framework-agreements-summary.component';

describe('FrameworkAgreementsSummaryComponent', () => {
  let component: FrameworkAgreementsSummaryComponent;
  let fixture: ComponentFixture<FrameworkAgreementsSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrameworkAgreementsSummaryComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrameworkAgreementsSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
