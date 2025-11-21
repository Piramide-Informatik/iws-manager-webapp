import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ListDemandsComponent } from './list-demands.component';

describe('ListDemandsComponent', () => {
  let component: ListDemandsComponent;
  let fixture: ComponentFixture<ListDemandsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ListDemandsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ListDemandsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
