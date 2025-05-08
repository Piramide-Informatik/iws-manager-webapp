import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingMethodsFormComponent } from './billing-methods-form.component';

describe('BillingMethodsFormComponent', () => {
  let component: BillingMethodsFormComponent;
  let fixture: ComponentFixture<BillingMethodsFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillingMethodsFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingMethodsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
