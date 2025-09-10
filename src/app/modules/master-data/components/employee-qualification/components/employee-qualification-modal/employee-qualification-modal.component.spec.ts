import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeQualificationModalComponent } from './employee-qualification-modal.component';

describe('EmployeeQualificationModalComponent', () => {
  let component: EmployeeQualificationModalComponent;
  let fixture: ComponentFixture<EmployeeQualificationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeQualificationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeQualificationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
