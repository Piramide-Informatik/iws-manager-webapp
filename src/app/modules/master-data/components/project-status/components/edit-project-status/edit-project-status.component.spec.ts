import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProjectStatusComponent } from './edit-project-status.component';

describe('EditProjectStatusComponent', () => {
  let component: EditProjectStatusComponent;
  let fixture: ComponentFixture<EditProjectStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditProjectStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProjectStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
