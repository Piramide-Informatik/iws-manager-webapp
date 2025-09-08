import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SubContractModalComponent } from './subcontract-modal.component';

describe('SubContractModalComponent', () => {
  let component: SubContractModalComponent;
  let fixture: ComponentFixture<SubContractModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SubContractModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SubContractModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
