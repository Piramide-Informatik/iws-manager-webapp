import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditSalutationComponent } from './edit-salutation.component';

describe('EditSalutationComponent', () => {
  let component: EditSalutationComponent;
  let fixture: ComponentFixture<EditSalutationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditSalutationComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditSalutationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
