import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalRealizationProbabilitiesComponent } from './modal-realization-probabilities.component';

describe('ModalRealizationProbabilitiesComponent', () => {
  let component: ModalRealizationProbabilitiesComponent;
  let fixture: ComponentFixture<ModalRealizationProbabilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalRealizationProbabilitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalRealizationProbabilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
