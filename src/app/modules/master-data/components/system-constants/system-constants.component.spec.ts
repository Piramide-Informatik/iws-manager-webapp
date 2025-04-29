import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemConstantsComponent } from './system-constants.component';

describe('SystemConstantsComponent', () => {
  let component: SystemConstantsComponent;
  let fixture: ComponentFixture<SystemConstantsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemConstantsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemConstantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
