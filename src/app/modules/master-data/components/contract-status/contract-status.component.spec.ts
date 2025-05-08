import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractStatusComponent } from './contract-status.component';

describe('ContractStatusComponent', () => {
  let component: ContractStatusComponent;
  let fixture: ComponentFixture<ContractStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
