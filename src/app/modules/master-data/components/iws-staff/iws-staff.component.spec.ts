import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsStaffComponent } from './iws-staff.component';

describe('IwsStaffComponent', () => {
  let component: IwsStaffComponent;
  let fixture: ComponentFixture<IwsStaffComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsStaffComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsStaffComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
