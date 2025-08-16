import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalFundingProgramComponent } from './modal-funding-program.component';

describe('ModalFundingProgramComponent', () => {
  let component: ModalFundingProgramComponent;
  let fixture: ComponentFixture<ModalFundingProgramComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalFundingProgramComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalFundingProgramComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
