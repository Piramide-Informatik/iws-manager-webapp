import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeQualificationTableComponent } from './employee-qualification-table.component';

describe('EmployeeQualificationTableComponent', () => {
  let component: EmployeeQualificationTableComponent;
  let fixture: ComponentFixture<EmployeeQualificationTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeQualificationTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeQualificationTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
