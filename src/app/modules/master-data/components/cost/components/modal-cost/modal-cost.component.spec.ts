import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalCostComponent } from './modal-cost.component';

describe('ModalCostComponent', () => {
  let component: ModalCostComponent;
  let fixture: ComponentFixture<ModalCostComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalCostComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalCostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
