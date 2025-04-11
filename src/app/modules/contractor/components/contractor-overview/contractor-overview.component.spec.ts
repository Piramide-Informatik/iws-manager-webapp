import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorOverviewComponent } from './contractor-overview.component';

describe('ContractorOverviewComponent', () => {
  let component: ContractorOverviewComponent;
  let fixture: ComponentFixture<ContractorOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractorOverviewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractorOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
