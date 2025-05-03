import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditNetworkComponent } from './edit-network.component';

describe('EditNetworkComponent', () => {
  let component: EditNetworkComponent;
  let fixture: ComponentFixture<EditNetworkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [EditNetworkComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EditNetworkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
