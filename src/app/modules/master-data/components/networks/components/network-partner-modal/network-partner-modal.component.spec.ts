import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkPartnerModalComponent } from './network-partner-modal.component';

describe('NetworkPartnerModalComponent', () => {
  let component: NetworkPartnerModalComponent;
  let fixture: ComponentFixture<NetworkPartnerModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NetworkPartnerModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkPartnerModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
