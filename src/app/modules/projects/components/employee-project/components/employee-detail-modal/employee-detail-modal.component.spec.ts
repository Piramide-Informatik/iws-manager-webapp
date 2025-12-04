import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeDetailModalComponent } from './employee-detail-modal.component';

describe('EmployeeDetailModalComponent', () => {
  let component: EmployeeDetailModalComponent;
  let fixture: ComponentFixture<EmployeeDetailModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeDetailModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeDetailModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
