import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddressTableComponent } from './salutation-table.component';

describe('AddressTableComponent', () => {
  let component: AddressTableComponent;
  let fixture: ComponentFixture<AddressTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AddressTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddressTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
