import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworkModalComponent } from './network-modal.component';

describe('EditNetworkComponent', () => {
  let component: NetworkModalComponent;
  let fixture: ComponentFixture<NetworkModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NetworkModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworkModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
