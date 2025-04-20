import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceTypesComponent } from './absence-types.component';

describe('AbsenceTypesComponent', () => {
  let component: AbsenceTypesComponent;
  let fixture: ComponentFixture<AbsenceTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AbsenceTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsenceTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
