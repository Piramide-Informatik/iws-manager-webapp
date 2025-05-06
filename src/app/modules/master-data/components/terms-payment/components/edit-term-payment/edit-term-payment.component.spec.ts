import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditTermPaymentComponent } from './edit-term-payment.component';

describe('EditTermPaymentComponent', () => {
  let component: EditTermPaymentComponent;
  let fixture: ComponentFixture<EditTermPaymentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditTermPaymentComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditTermPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
