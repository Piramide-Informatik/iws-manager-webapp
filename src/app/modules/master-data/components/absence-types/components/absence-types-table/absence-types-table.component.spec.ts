import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AbsenceTypesTableComponent } from './absence-types-table.component';

describe('AbsenceTypesTableComponent', () => {
  let component: AbsenceTypesTableComponent;
  let fixture: ComponentFixture<AbsenceTypesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AbsenceTypesTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AbsenceTypesTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
