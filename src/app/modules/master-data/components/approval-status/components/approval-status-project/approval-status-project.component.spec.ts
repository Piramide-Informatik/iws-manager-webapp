import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ApprovalStatusProjectComponent } from './approval-status-project.component';

describe('ApprovalStatusProjectComponent', () => {
  let component: ApprovalStatusProjectComponent;
  let fixture: ComponentFixture<ApprovalStatusProjectComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ApprovalStatusProjectComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApprovalStatusProjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
