import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditUserFormComponent } from './edit-user-form.component';

describe('EditUserFormComponent', () => {
  let component: EditUserFormComponent;
  let fixture: ComponentFixture<EditUserFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditUserFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditUserFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
