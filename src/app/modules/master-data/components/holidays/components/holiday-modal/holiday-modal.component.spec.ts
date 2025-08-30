import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HolidayModalComponent } from './holiday-modal.component';

describe('HolidayModalComponent', () => {
  let component: HolidayModalComponent;
  let fixture: ComponentFixture<HolidayModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [HolidayModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HolidayModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
