import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalApprovalStatusComponent } from './modal-approval-status.component';

describe('ModalApprovalStatusComponent', () => {
  let component: ModalApprovalStatusComponent;
  let fixture: ComponentFixture<ModalApprovalStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalApprovalStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalApprovalStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
