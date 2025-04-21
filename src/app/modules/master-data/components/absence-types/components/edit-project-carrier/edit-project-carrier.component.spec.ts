import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProjectCarrierComponent } from './edit-project-carrier.component';

describe('EditProjectCarrierComponent', () => {
  let component: EditProjectCarrierComponent;
  let fixture: ComponentFixture<EditProjectCarrierComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditProjectCarrierComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProjectCarrierComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
