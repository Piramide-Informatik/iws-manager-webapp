import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesTaxFormComponent } from './sales-tax-form.component';

describe('SalesTaxFormComponent', () => {
  let component: SalesTaxFormComponent;
  let fixture: ComponentFixture<SalesTaxFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesTaxFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesTaxFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
