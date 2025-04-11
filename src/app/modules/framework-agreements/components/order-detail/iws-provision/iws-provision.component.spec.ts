import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsProvisionComponent } from './iws-provision.component';

describe('IwsProvisionComponent', () => {
  let component: IwsProvisionComponent;
  let fixture: ComponentFixture<IwsProvisionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsProvisionComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsProvisionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
