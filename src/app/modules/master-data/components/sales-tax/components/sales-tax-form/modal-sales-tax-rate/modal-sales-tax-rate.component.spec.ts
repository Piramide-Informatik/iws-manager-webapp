import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalSalesTaxRateComponent } from './modal-sales-tax-rate.component';

describe('ModalSalesTaxRateComponent', () => {
  let component: ModalSalesTaxRateComponent;
  let fixture: ComponentFixture<ModalSalesTaxRateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalSalesTaxRateComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalSalesTaxRateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
