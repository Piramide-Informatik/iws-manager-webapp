import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalutationModalComponent } from './salutation-modal.component';

describe('SalutationModalComponent', () => {
  let component: SalutationModalComponent;
  let fixture: ComponentFixture<SalutationModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalutationModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalutationModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
