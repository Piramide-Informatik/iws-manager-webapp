import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BillingMethodsTableComponent } from './billing-methods-table.component';

describe('BillingMethodsTableComponent', () => {
  let component: BillingMethodsTableComponent;
  let fixture: ComponentFixture<BillingMethodsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [BillingMethodsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BillingMethodsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
