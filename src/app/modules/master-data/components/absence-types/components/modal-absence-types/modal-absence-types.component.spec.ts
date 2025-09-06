import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalAbsenceTypesComponent } from './modal-absence-types.component';

describe('ModalAbsenceTypesComponent', () => {
  let component: ModalAbsenceTypesComponent;
  let fixture: ComponentFixture<ModalAbsenceTypesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalAbsenceTypesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalAbsenceTypesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
