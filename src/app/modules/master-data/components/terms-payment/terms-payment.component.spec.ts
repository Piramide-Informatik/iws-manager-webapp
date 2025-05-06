import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TermsPaymentComponent } from './terms-payment.component';

describe('TermsPaymentComponent', () => {
  let component: TermsPaymentComponent;
  let fixture: ComponentFixture<TermsPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TermsPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TermsPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
