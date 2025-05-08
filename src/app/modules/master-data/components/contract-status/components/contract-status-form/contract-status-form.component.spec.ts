import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractStatusFormComponent } from './contract-status-form.component';

describe('ContractStatusFormComponent', () => {
  let component: ContractStatusFormComponent;
  let fixture: ComponentFixture<ContractStatusFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractStatusFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractStatusFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
