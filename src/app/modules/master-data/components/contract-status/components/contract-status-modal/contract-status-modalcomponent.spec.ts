import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractStatusModalComponent } from './contract-status-modalcomponent';

describe('ContractStatusModalComponent', () => {
  let component: ContractStatusModalComponent;
  let fixture: ComponentFixture<ContractStatusModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractStatusModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractStatusModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
