import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemConstantTableComponent } from './system-constant-table.component';

describe('SystemConstantTableComponent', () => {
  let component: SystemConstantTableComponent;
  let fixture: ComponentFixture<SystemConstantTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SystemConstantTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemConstantTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
