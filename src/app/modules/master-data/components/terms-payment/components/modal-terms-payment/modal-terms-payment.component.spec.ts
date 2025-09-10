import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalTermsPaymentComponent } from './modal-terms-payment.component';

describe('ModalTermsPaymentComponent', () => {
  let component: ModalTermsPaymentComponent;
  let fixture: ComponentFixture<ModalTermsPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalTermsPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalTermsPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
