import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContractorDetailsComponent } from './contractor-details.component';

describe('ContractorDetailsComponent', () => {
  let component: ContractorDetailsComponent;
  let fixture: ComponentFixture<ContractorDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ContractorDetailsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ContractorDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
