import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListWorkContractsComponent } from './list-work-contracts.component';

describe('ListCustomersComponent', () => {
  let component: ListWorkContractsComponent;
  let fixture: ComponentFixture<ListWorkContractsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListWorkContractsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ListWorkContractsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
