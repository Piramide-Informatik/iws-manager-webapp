import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBillingMethodsComponent } from './modal-billing-methods.component';

describe('ModalBillingMethodsComponent', () => {
  let component: ModalBillingMethodsComponent;
  let fixture: ComponentFixture<ModalBillingMethodsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalBillingMethodsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalBillingMethodsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
