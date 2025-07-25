import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModelProjectStatusComponent } from './model-project-status.component';

describe('ModelProjectStatusComponent', () => {
  let component: ModelProjectStatusComponent;
  let fixture: ComponentFixture<ModelProjectStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModelProjectStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModelProjectStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
