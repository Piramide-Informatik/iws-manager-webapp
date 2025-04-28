import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IwsCommissionsTableComponent } from './iws-commissions-table.component';

describe('IwsCommissionsTableComponent', () => {
  let component: IwsCommissionsTableComponent;
  let fixture: ComponentFixture<IwsCommissionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [IwsCommissionsTableComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IwsCommissionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
