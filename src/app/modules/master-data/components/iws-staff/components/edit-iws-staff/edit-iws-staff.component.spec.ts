import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditIwsStaffComponent } from './edit-iws-staff.component';

describe('EditIwsStaffComponent', () => {
  let component: EditIwsStaffComponent;
  let fixture: ComponentFixture<EditIwsStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditIwsStaffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditIwsStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
