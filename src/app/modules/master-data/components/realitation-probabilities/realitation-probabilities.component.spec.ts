import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RealitationProbabilitiesComponent } from './realitation-probabilities.component';

describe('RealitationProbabilitiesComponent', () => {
  let component: RealitationProbabilitiesComponent;
  let fixture: ComponentFixture<RealitationProbabilitiesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [RealitationProbabilitiesComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RealitationProbabilitiesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
