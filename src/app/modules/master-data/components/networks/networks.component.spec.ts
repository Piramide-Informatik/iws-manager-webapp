import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NetworksComponent } from './networks.component';

describe('NetworksComponent', () => {
  let component: NetworksComponent;
  let fixture: ComponentFixture<NetworksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [NetworksComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(NetworksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
