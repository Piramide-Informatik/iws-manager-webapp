import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsStaffTableComponent } from './iws-staff-table.component';

describe('IwsStaffTableComponent', () => {
  let component: IwsStaffTableComponent;
  let fixture: ComponentFixture<IwsStaffTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsStaffTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsStaffTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
