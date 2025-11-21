import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListSubcontractsComponent } from './list-subcontracts.component';

describe('ListSubcontractsComponent', () => {
  let component: ListSubcontractsComponent;
  let fixture: ComponentFixture<ListSubcontractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListSubcontractsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListSubcontractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
