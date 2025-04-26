import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDunningLevelComponent } from './edit-dunning-level.component';

describe('EditDunningLevelComponent', () => {
  let component: EditDunningLevelComponent;
  let fixture: ComponentFixture<EditDunningLevelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditDunningLevelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditDunningLevelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
