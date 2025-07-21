import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableProjectStatusComponent } from './table-project-status.component';

describe('TableProjectStatusComponent', () => {
  let component: TableProjectStatusComponent;
  let fixture: ComponentFixture<TableProjectStatusComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [TableProjectStatusComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableProjectStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
