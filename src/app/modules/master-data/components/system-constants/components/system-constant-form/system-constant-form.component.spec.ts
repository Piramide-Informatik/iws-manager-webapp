import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemConstantFormComponent } from './system-constant-form.component';

describe('SystemConstantFormComponent', () => {
  let component: SystemConstantFormComponent;
  let fixture: ComponentFixture<SystemConstantFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemConstantFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemConstantFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
