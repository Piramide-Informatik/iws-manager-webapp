import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalBillerComponent } from './modal-biller.component';

describe('ModalBillerComponent', () => {
  let component: ModalBillerComponent;
  let fixture: ComponentFixture<ModalBillerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalBillerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalBillerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
