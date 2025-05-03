import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTaxTableComponent } from './sales-tax-table.component';

describe('SalesTaxTableComponent', () => {
  let component: SalesTaxTableComponent;
  let fixture: ComponentFixture<SalesTaxTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesTaxTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesTaxTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
