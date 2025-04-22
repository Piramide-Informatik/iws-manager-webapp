import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditApprovalStatusComponent } from './edit-approval-status.component';

describe('EditApprovalStatusComponent', () => {
  let component: EditApprovalStatusComponent;
  let fixture: ComponentFixture<EditApprovalStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditApprovalStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditApprovalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
