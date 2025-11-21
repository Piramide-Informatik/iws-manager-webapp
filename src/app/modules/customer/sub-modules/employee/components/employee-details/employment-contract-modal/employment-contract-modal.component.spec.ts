import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmploymentContractModalComponent } from './employment-contract-modal.component';

describe('EmploymentContractModalComponent', () => {
  let component: EmploymentContractModalComponent;
  let fixture: ComponentFixture<EmploymentContractModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EmploymentContractModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmploymentContractModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
