import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTaxModalComponent } from './sales-tax-modal.component';

describe('SalesTaxModalComponent', () => {
  let component: SalesTaxModalComponent;
  let fixture: ComponentFixture<SalesTaxModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesTaxModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesTaxModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
