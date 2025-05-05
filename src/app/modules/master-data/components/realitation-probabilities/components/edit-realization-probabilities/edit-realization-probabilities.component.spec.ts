import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditRealizationProbabilitiesComponent } from './edit-realization-probabilities.component';

describe('EditRealizationProbabilitiesComponent', () => {
  let component: EditRealizationProbabilitiesComponent;
  let fixture: ComponentFixture<EditRealizationProbabilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditRealizationProbabilitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditRealizationProbabilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
