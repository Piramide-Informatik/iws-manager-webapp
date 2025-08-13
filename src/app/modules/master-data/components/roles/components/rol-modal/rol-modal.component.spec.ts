import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RolModalComponent } from './rol-modal.component';

describe('RolModalComponent', () => {
  let component: RolModalComponent;
  let fixture: ComponentFixture<RolModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RolModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RolModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
