import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditCostComponent } from './edit-cost.component';

describe('EditCostComponent', () => {
  let component: EditCostComponent;
  let fixture: ComponentFixture<EditCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditCostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
