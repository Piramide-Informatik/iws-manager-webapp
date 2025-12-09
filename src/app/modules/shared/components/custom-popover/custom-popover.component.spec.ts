import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomPopoverComponent } from './custom-popover.component';

describe('CustomPopoverComponent', () => {
  let component: CustomPopoverComponent;
  let fixture: ComponentFixture<CustomPopoverComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CustomPopoverComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CustomPopoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
