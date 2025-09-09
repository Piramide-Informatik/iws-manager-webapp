import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ModalProjectFunnelComponent } from './modal-project-funnel.component';

describe('ModalProjectFunnelComponent', () => {
  let component: ModalProjectFunnelComponent;
  let fixture: ComponentFixture<ModalProjectFunnelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ModalProjectFunnelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ModalProjectFunnelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
