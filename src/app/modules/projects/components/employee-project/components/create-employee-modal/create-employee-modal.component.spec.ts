import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateEmployeeModalComponent } from './create-employee-modal.component';

describe('CreateEmployeeModalComponent', () => {
  let component: CreateEmployeeModalComponent;
  let fixture: ComponentFixture<CreateEmployeeModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CreateEmployeeModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CreateEmployeeModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
