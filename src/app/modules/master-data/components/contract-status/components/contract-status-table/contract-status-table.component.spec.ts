import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractStatusTableComponent } from './contract-status-table.component';

describe('ContractStatusTableComponent', () => {
  let component: ContractStatusTableComponent;
  let fixture: ComponentFixture<ContractStatusTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractStatusTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractStatusTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
