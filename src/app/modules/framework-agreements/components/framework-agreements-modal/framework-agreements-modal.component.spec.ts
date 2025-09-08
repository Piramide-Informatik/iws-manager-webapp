import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameworkAgreementsModalComponent } from './framework-agreements-modal.component';

describe('FrameworkAgreementsSummaryComponent', () => {
  let component: FrameworkAgreementsModalComponent;
  let fixture: ComponentFixture<FrameworkAgreementsModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrameworkAgreementsModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrameworkAgreementsModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
