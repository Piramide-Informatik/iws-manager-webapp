import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditProjectFunnelComponent } from './edit-project-funnel.component';

describe('EditProjectFunnelComponent', () => {
  let component: EditProjectFunnelComponent;
  let fixture: ComponentFixture<EditProjectFunnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditProjectFunnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditProjectFunnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
