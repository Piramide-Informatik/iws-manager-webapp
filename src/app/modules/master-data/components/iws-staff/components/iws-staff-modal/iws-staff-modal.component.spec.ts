import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsStaffModalComponent } from './iws-staff-modal.component';

describe('IwsStaffModalComponent', () => {
  let component: IwsStaffModalComponent;
  let fixture: ComponentFixture<IwsStaffModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsStaffModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsStaffModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
