import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FrameworkAgreementsDetailsComponent } from './framework-agreement-details.component';

describe('OrderDetailComponent', () => {
  let component: FrameworkAgreementsDetailsComponent;
  let fixture: ComponentFixture<FrameworkAgreementsDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [FrameworkAgreementsDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FrameworkAgreementsDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
