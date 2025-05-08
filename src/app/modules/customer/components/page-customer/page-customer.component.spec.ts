import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageCustomerComponent } from './page-customer.component';

describe('PageCustomerComponent', () => {
  let component: PageCustomerComponent;
  let fixture: ComponentFixture<PageCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [PageCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PageCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
