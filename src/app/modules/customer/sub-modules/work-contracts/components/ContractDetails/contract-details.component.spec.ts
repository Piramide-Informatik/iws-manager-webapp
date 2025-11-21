import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractDetailsComponent } from './contract-details.component';

describe('ContractDetailComponent', () => {
  let component: ContractDetailsComponent;
  let fixture: ComponentFixture<ContractDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

