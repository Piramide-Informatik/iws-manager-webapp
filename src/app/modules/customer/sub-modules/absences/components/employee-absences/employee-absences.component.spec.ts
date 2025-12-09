import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeAbsencesComponent } from './employee-absences.component';

describe('EmployeeAbsencesComponent', () => {
  let component: EmployeeAbsencesComponent;
  let fixture: ComponentFixture<EmployeeAbsencesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmployeeAbsencesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeAbsencesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
