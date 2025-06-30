import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OccErrorModalComponent } from './occ-error-modal.component';

describe('OccErrorModalComponent', () => {
  let component: OccErrorModalComponent;
  let fixture: ComponentFixture<OccErrorModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [OccErrorModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OccErrorModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
